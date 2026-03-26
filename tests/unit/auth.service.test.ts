import { AuthService } from '../../src/services/auth.service';
import { ConflictError, UnauthorizedError } from '../../src/utils/AppError';

// Mock Prisma
jest.mock('../../src/config/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('../../src/utils/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

import { prisma } from '../../src/config/database';

const mockPrismaUser = prisma.user as jest.Mocked<typeof prisma.user>;

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService();
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('throws ConflictError when email already exists', async () => {
      mockPrismaUser.findUnique.mockResolvedValue({ id: '1' } as never);
      await expect(
        service.register({ email: 'test@example.com', password: 'password123', name: 'Test' }),
      ).rejects.toThrow(ConflictError);
    });

    it('creates user and returns tokens on success', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);
      mockPrismaUser.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test',
        role: 'user',
        createdAt: new Date(),
      } as never);

      const result = await service.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('test@example.com');
    });
  });

  describe('login', () => {
    it('throws UnauthorizedError for non-existent email', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);
      await expect(service.login('no@example.com', 'pass')).rejects.toThrow(UnauthorizedError);
    });
  });
});
