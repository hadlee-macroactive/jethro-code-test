jest.mock('../../../src/services/notification.service');
jest.mock('../../../src/config/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() }
}));

import { notificationQueueJob } from '../../../src/jobs/notification-queue.job';
import { NotificationService } from '../../../src/services/notification.service';

describe('notificationQueueJob', () => {
  let notificationServiceInstance: any;

  beforeEach(() => {
    notificationServiceInstance = {
      sendBatch: jest.fn()
    };
    (NotificationService as any).mockImplementation(() => notificationServiceInstance);
  });

  it('should send batch notifications', async () => {
    const payloads = [
      { userId: 1, title: 'Test', body: 'Body' },
      { userId: 2, title: 'Test 2', body: 'Body 2' }
    ];
    const job = { data: { payloads } } as any;

    const result = await notificationQueueJob(job);

    expect(notificationServiceInstance.sendBatch).toHaveBeenCalledWith(payloads);
    expect(result.processed).toBe(2);
  });

  it('should handle empty payloads', async () => {
    const job = { data: { payloads: [] } } as any;
    const result = await notificationQueueJob(job);
    expect(result.processed).toBe(0);
  });

  it('should handle missing payloads', async () => {
    const job = { data: {} } as any;
    const result = await notificationQueueJob(job);
    expect(result.processed).toBe(0);
  });

  it('should re-throw errors', async () => {
    notificationServiceInstance.sendBatch.mockRejectedValue(new Error('Send error'));
    const job = { data: { payloads: [{ userId: 1 }] } } as any;
    await expect(notificationQueueJob(job)).rejects.toThrow('Send error');
  });
});
