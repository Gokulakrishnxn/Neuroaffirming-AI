import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { env } from '../config/environment';
import { JwtPayload, UserRole } from '../types';
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/AppError';

interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export class AuthService {
  private signAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, env.jwt.secret, { expiresIn: env.jwt.expiresIn } as jwt.SignOptions);
  }

  private signRefreshToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpiresIn } as jwt.SignOptions);
  }

  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw new ConflictError('Email already in use');

    const hashedPassword = await bcrypt.hash(input.password, 12);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        name: input.name,
        role: UserRole.USER,
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    const payload = { id: user.id, email: user.email, role: user.role as UserRole };
    return {
      user,
      accessToken: this.signAccessToken(payload),
      refreshToken: this.signRefreshToken(payload),
    };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedError('Invalid credentials');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedError('Invalid credentials');

    const payload = { id: user.id, email: user.email, role: user.role as UserRole };
    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      accessToken: this.signAccessToken(payload),
      refreshToken: this.signRefreshToken(payload),
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, env.jwt.refreshSecret) as JwtPayload;
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user) throw new UnauthorizedError('User not found');

      const payload = { id: user.id, email: user.email, role: user.role as UserRole };
      return {
        accessToken: this.signAccessToken(payload),
        refreshToken: this.signRefreshToken(payload),
      };
    } catch {
      throw new UnauthorizedError('Invalid refresh token');
    }
  }

  async logout(_userId: string): Promise<void> {
    // Token invalidation handled client-side; extend with a denylist if needed
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, createdAt: true, preferences: true },
    });
    if (!user) throw new NotFoundError('User');
    return user;
  }
}
