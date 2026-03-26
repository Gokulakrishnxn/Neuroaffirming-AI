import { prisma } from '../config/database';
import { NotFoundError } from '../utils/AppError';

interface UpdateProfileInput {
  name?: string;
  preferences?: {
    theme?: string;
    fontSize?: string;
    reduceMotion?: boolean;
    highContrast?: boolean;
  };
}

export class UserService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        preferences: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) throw new NotFoundError('User');
    return user;
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.preferences && { preferences: input.preferences }),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        preferences: true,
        updatedAt: true,
      },
    });
    return user;
  }

  async deleteAccount(userId: string) {
    await prisma.user.delete({ where: { id: userId } });
  }
}
