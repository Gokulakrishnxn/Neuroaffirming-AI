import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendCreated } from '../utils/apiResponse';

const authService = new AuthService();

export class AuthController {
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await authService.register(req.body);
      sendCreated(res, result, 'Account created successfully');
    } catch (err) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await authService.login(req.body.email, req.body.password);
      sendSuccess(res, result, 'Login successful');
    } catch (err) {
      next(err);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await authService.refreshTokens(req.body.refreshToken);
      sendSuccess(res, result, 'Tokens refreshed');
    } catch (err) {
      next(err);
    }
  };

  logout = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await authService.logout(req.user!.id);
      sendSuccess(res, null, 'Logged out successfully');
    } catch (err) {
      next(err);
    }
  };

  me = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await authService.getMe(req.user!.id);
      sendSuccess(res, user);
    } catch (err) {
      next(err);
    }
  };
}
