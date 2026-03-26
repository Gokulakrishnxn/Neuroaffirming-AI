import request from 'supertest';
import { createApp } from '../../src/app';

jest.mock('../../src/config/database', () => ({
  prisma: {},
  connectDatabases: jest.fn(),
  disconnectDatabases: jest.fn(),
}));

jest.mock('../../src/utils/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), http: jest.fn() },
}));

describe('GET /api/v1/health', () => {
  it('returns 200 with health status', async () => {
    const { app } = createApp();
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('BLOOM API is healthy');
  });
});
