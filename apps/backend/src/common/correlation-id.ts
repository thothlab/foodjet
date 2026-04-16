import { randomUUID } from 'node:crypto';
import type { FastifyRequest, FastifyReply } from 'fastify';

export function correlationIdHook(
  request: FastifyRequest,
  _reply: FastifyReply,
  done: () => void,
): void {
  if (!request.headers['x-correlation-id']) {
    (request.headers as Record<string, string>)['x-correlation-id'] = randomUUID();
  }
  done();
}
