import { authMiddleware } from '../../../src/api/middleware/auth.middleware';
import jwt from 'jsonwebtoken';

describe('authMiddleware', () => {
  let mockRequest: any;
  let mockReply: any;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      user: undefined
    };
    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
  });

  it('should return 401 when no authorization header', async () => {
    await authMiddleware(mockRequest, mockReply);
    expect(mockReply.status).toHaveBeenCalledWith(401);
    expect(mockReply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: 'UNAUTHORIZED' })
      })
    );
  });

  it('should set request.user on valid token', async () => {
    const token = jwt.sign(
      { userId: 1, creatorId: 100, role: 'user' },
      process.env.JWT_SECRET!
    );
    mockRequest.headers.authorization = `Bearer ${token}`;

    await authMiddleware(mockRequest, mockReply);

    expect(mockRequest.user).toEqual({
      id: 1,
      creatorId: 100,
      role: 'user'
    });
    expect(mockReply.status).not.toHaveBeenCalled();
  });

  it('should return 401 for invalid token', async () => {
    mockRequest.headers.authorization = 'Bearer invalid-token';
    await authMiddleware(mockRequest, mockReply);
    expect(mockReply.status).toHaveBeenCalledWith(401);
    expect(mockReply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'INVALID_TOKEN' })
      })
    );
  });

  it('should return 401 for expired token', async () => {
    const token = jwt.sign(
      { userId: 1, creatorId: 100, role: 'user' },
      process.env.JWT_SECRET!,
      { expiresIn: '-1s' }
    );
    mockRequest.headers.authorization = `Bearer ${token}`;
    await authMiddleware(mockRequest, mockReply);
    expect(mockReply.status).toHaveBeenCalledWith(401);
  });

  it('should default role to "user" when not in token', async () => {
    const token = jwt.sign(
      { userId: 1, creatorId: 100 },
      process.env.JWT_SECRET!
    );
    mockRequest.headers.authorization = `Bearer ${token}`;
    await authMiddleware(mockRequest, mockReply);
    expect(mockRequest.user.role).toBe('user');
  });
});
