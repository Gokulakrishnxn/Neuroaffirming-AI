import { Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendNoContent } from '../utils/apiResponse';

const userService = new UserService();

export class UserController {
  getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await userService.getProfile(req.user!.id);
      sendSuccess(res, user);
    } catch (err) {
      next(err);
    }
  };

  updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await userService.updateProfile(req.user!.id, req.body);
      sendSuccess(res, user, 'Profile updated');
    } catch (err) {
      next(err);
    }
  };

  deleteAccount = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await userService.deleteAccount(req.user!.id);
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  };
}
