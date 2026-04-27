import { validate } from '../../../src/api/middleware/validation.middleware';
import { z } from 'zod';

describe('validationMiddleware', () => {
  let mockRequest: any;
  let mockReply: any;

  beforeEach(() => {
    mockRequest = {
      params: {},
      query: {},
      body: {}
    };
    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
  });

  it('should pass validation for valid data', async () => {
    const schema = z.object({
      params: z.object({ userId: z.string() }),
      query: z.object({}).passthrough(),
      body: z.object({}).passthrough()
    });
    const middleware = validate(schema);
    mockRequest.params = { userId: '123' };

    await middleware(mockRequest, mockReply);
    expect(mockRequest.validated).toBeDefined();
    expect(mockRequest.validated.params.userId).toBe('123');
    expect(mockReply.status).not.toHaveBeenCalled();
  });

  it('should return 400 for invalid data', async () => {
    const schema = z.object({
      params: z.object({ userId: z.string().min(1) }),
      query: z.object({}).passthrough(),
      body: z.object({}).passthrough()
    });
    const middleware = validate(schema);
    mockRequest.params = {};

    await middleware(mockRequest, mockReply);
    expect(mockReply.status).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: 'VALIDATION_ERROR' })
      })
    );
  });

  it('should include validation error details', async () => {
    const schema = z.object({
      params: z.object({ userId: z.string().email() }),
      query: z.object({}).passthrough(),
      body: z.object({}).passthrough()
    });
    const middleware = validate(schema);
    mockRequest.params = { userId: 'not-an-email' };

    await middleware(mockRequest, mockReply);
    const call = mockReply.send.mock.calls[0][0];
    expect(call.error.details).toBeDefined();
    expect(Array.isArray(call.error.details)).toBe(true);
  });
});
