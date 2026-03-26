import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import chatRoutes from './chat.routes';
import userRoutes from './user.routes';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'BLOOM API is healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? '1.0.0',
  });
});

router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);
router.use('/users', userRoutes);

export default router;
