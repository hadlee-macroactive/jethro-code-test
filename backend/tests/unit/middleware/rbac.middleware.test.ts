import { rbacMiddleware } from '../../../src/api/middleware/rbac.middleware';

describe('rbacMiddleware', () => {
  let mockRequest: any;
  let mockReply: any;

  beforeEach(() => {
    mockRequest = {};
    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
  });

  it('should return 401 when no user on request', async () => {
    const middleware = rbacMiddleware('read:own_streaks');
    await middleware(mockRequest, mockReply);
    expect(mockReply.status).toHaveBeenCalledWith(401);
  });

  it('should allow user with matching permission', async () => {
    mockRequest.user = { id: 1, role: 'user' };
    const middleware = rbacMiddleware('read:own_streaks');
    await middleware(mockRequest, mockReply);
    expect(mockReply.status).not.toHaveBeenCalled();
  });

  it('should deny user without required permission', async () => {
    mockRequest.user = { id: 1, role: 'user' };
    const middleware = rbacMiddleware('write:creator_config');
    await middleware(mockRequest, mockReply);
    expect(mockReply.status).toHaveBeenCalledWith(403);
  });

  it('should allow creator with matching permission', async () => {
    mockRequest.user = { id: 1, role: 'creator' };
    const middleware = rbacMiddleware('write:creator_config');
    await middleware(mockRequest, mockReply);
    expect(mockReply.status).not.toHaveBeenCalled();
  });

  it('should allow admin for any permission', async () => {
    mockRequest.user = { id: 1, role: 'admin' };
    const middleware = rbacMiddleware('write:creator_config');
    await middleware(mockRequest, mockReply);
    expect(mockReply.status).not.toHaveBeenCalled();
  });

  it('should deny unknown role', async () => {
    mockRequest.user = { id: 1, role: 'guest' };
    const middleware = rbacMiddleware('read:own_streaks');
    await middleware(mockRequest, mockReply);
    expect(mockReply.status).toHaveBeenCalledWith(403);
  });
});
