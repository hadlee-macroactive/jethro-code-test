import { FastifyRequest, FastifyReply } from 'fastify';
import { CreatorConfigService } from '../../services/creator-config.service';

export class CreatorController {
  private configService: CreatorConfigService;

  constructor() {
    this.configService = new CreatorConfigService();
  }

  async getConfig(request: FastifyRequest, reply: FastifyReply) {
    const { creatorId } = request.params as { creatorId: string };
    const user = (request as any).user;

    if (user.creatorId !== parseInt(creatorId) && user.role !== 'admin') {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Access denied' }
      });
    }

    const config = await this.configService.getConfig(parseInt(creatorId));
    return reply.send({ success: true, data: config });
  }

  async updateConfig(request: FastifyRequest, reply: FastifyReply) {
    const { creatorId } = request.params as { creatorId: string };
    const body = request.body as any;
    const user = (request as any).user;

    if (user.creatorId !== parseInt(creatorId) && user.role !== 'admin') {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Access denied' }
      });
    }

    const config = await this.configService.updateConfig(parseInt(creatorId), body);
    return reply.send({ success: true, data: config });
  }
}
