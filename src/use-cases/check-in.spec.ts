import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository'
import { CheckInUseCase } from './check-in'
import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { MaxNumberOfCheckInsError } from './errors/max-number-of-check-ins-error'
import { MaxDistanceError } from './errors/max-distance-error'

let checkInsRepository: InMemoryCheckInsRepository
let gymsRepository: InMemoryGymsRepository
let sut: CheckInUseCase

describe('Check-in Use Case', () => {
  beforeEach(async () => {
    checkInsRepository = new InMemoryCheckInsRepository()
    gymsRepository = new InMemoryGymsRepository()
    sut = new CheckInUseCase(checkInsRepository, gymsRepository)

    await gymsRepository.create({
      id: 'gym-01',
      title: 'JavaScript Gym',
      description: '',
      latitude: -29.6991661,
      longitude: -52.4431261,
      phone: '',
    })

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to check in', async () => {
    const { checkIn } = await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatitude: -29.698854,
      userLongitude: -52.442337,
    })

    expect(checkIn.id).toEqual(expect.any(String))
  })

  it('should not be able to check-in twice in the same day', async () => {
    vi.setSystemTime(new Date(2023, 3, 19, 0, 0, 0))

    await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatitude: -29.698854,
      userLongitude: -52.442337,
    })

    await expect(() =>
      sut.execute({
        gymId: 'gym-01',
        userId: 'user-01',
        userLatitude: -29.698854,
        userLongitude: -52.442337,
      }),
    ).rejects.toBeInstanceOf(MaxNumberOfCheckInsError)
  })

  it('should be able to check-in in different days', async () => {
    vi.setSystemTime(new Date(2023, 3, 20, 0, 0, 0))

    await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatitude: -29.698854,
      userLongitude: -52.442337,
    })

    vi.setSystemTime(new Date(2023, 3, 21, 0, 0, 0))

    const { checkIn } = await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatitude: -29.698854,
      userLongitude: -52.442337,
    })

    expect(checkIn.id).toEqual(expect.any(String))
  })

  it('should not be able to check-in on distant gyms', async () => {
    await gymsRepository.create({
      id: 'gym-02',
      title: 'JavaScript Gym',
      description: '',
      latitude: -29.695861715784435,
      longitude: -52.442491749207385,
      phone: '',
    })

    await expect(() =>
      sut.execute({
        gymId: 'gym-02',
        userId: 'user-01',
        userLatitude: -29.696817177159677,
        userLongitude: -52.44225699826643,
      }),
    ).rejects.toBeInstanceOf(MaxDistanceError)
  })
})
