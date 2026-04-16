import pino from 'pino';
import { env } from './env.js';

export const logger = pino({
  level: env.LOG_LEVEL,
  transport: env.NODE_ENV === 'development'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
  serializers: {
    req(req) {
      return {
        method: req.method,
        url: req.url,
        correlationId: req.headers?.['x-correlation-id'],
      };
    },
  },
});
