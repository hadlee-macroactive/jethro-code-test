import { FastifyInstance } from 'fastify';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const JWT_ISSUER = process.env.JWT_ISSUER || 'macroactive';

export async function authRoutes(fastify: FastifyInstance) {
  // POST /auth/login - Demo login (accepts email, returns JWT)
  fastify.post('/login', async (request, reply) => {
    const { email } = request.body as { email?: string };

    if (!email) {
      return reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Email is required' }
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return reply.status(404).send({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'No account found with that email' }
      });
    }

    // Determine role and creatorId for demo purposes
    // Default to 'user' role with creatorId 100 (MacroActive Fitness)
    const creatorId = 100;
    const role = 'user';

    const token = jwt.sign(
      {
        userId: Number(user.id),
        creatorId,
        role,
        email: user.email,
        name: user.name,
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
        issuer: JWT_ISSUER,
      }
    );

    return reply.send({
      success: true,
      data: {
        token,
        user: {
          userId: Number(user.id),
          creatorId,
          role,
          name: user.name,
          email: user.email,
        }
      }
    });
  });

  // POST /auth/login-creator - Login as creator
  fastify.post('/login-creator', async (request, reply) => {
    const { email } = request.body as { email?: string };

    if (!email) {
      return reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Email is required' }
      });
    }

    const creator = await prisma.creator.findUnique({ where: { email } });

    if (!creator) {
      return reply.status(404).send({
        success: false,
        error: { code: 'CREATOR_NOT_FOUND', message: 'No creator account found with that email' }
      });
    }

    const token = jwt.sign(
      {
        userId: Number(creator.id),
        creatorId: Number(creator.id),
        role: 'creator',
        email: creator.email,
        name: creator.name,
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
        issuer: JWT_ISSUER,
      }
    );

    return reply.send({
      success: true,
      data: {
        token,
        user: {
          userId: Number(creator.id),
          creatorId: Number(creator.id),
          role: 'creator',
          name: creator.name,
          email: creator.email,
        }
      }
    });
  });

  // GET /auth/me - Get current user from JWT
  fastify.get('/me', async (request, reply) => {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Missing authorization header' }
      });
    }

    try {
      const token = authHeader.replace('Bearer ', '');
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      return reply.send({
        success: true,
        data: {
          userId: decoded.userId,
          creatorId: decoded.creatorId,
          role: decoded.role,
          name: decoded.name,
          email: decoded.email,
        }
      });
    } catch {
      return reply.status(401).send({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' }
      });
    }
  });
}
