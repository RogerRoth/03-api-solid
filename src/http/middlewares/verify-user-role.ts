import { FastifyReply, FastifyRequest } from 'fastify'

export type UserRoleType = 'ADMIN' | 'MEMBER'

export function verifyUserRole(roleToVerify: UserRoleType[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const { role } = request.user

    if (!roleToVerify.includes(role)) {
      return reply.status(401).send({ message: 'Unauthorized.' })
    }
  }
}
