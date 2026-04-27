import { FastifyRequest, FastifyReply } from 'fastify';

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitStore>();
const TTL = parseInt(process.env.RATE_LIMIT_TTL || '60') * 1000;
const MAX = parseInt(process.env.RATE_LIMIT_MAX || '100');

export function rateLimitMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
  done: () => void
) {
  const ip = request.ip;
  const now = Date.now();

  const entry = store.get(ip);

  if (!entry || now > entry.resetTime) {
    store.set(ip, { count: 1, resetTime: now + TTL });
    done();
    return;
  }

  if (entry.count >= MAX) {
    reply.status(429).send({
      success: false,
      error: { code: 'RATE_LIMITED', message: 'Too many requests' }
    });
    return;
  }

  entry.count++;
  done();
}
