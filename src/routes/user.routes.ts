import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import Joi from 'joi';

const router = Router();
const controller = new UserController();

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  preferences: Joi.object({
    theme: Joi.string().valid('light', 'dark', 'system').optional(),
    fontSize: Joi.string().valid('small', 'medium', 'large').optional(),
    reduceMotion: Joi.boolean().optional(),
    highContrast: Joi.boolean().optional(),
  }).optional(),
});

router.use(authenticate);

router.get('/profile', controller.getProfile);
router.patch('/profile', validate(updateProfileSchema), controller.updateProfile);
router.delete('/account', controller.deleteAccount);

export default router;
