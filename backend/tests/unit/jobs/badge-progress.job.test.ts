jest.mock('../../../src/config/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() }
}));

import { badgeProgressJob } from '../../../src/jobs/badge-progress.job';

describe('badgeProgressJob', () => {
  it('should complete successfully', async () => {
    const result = await badgeProgressJob({} as any);
    expect(result.processed).toBe(true);
  });
});
