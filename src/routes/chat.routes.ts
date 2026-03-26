import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { authenticate } from '../middleware/authenticate';
import { rateLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';
import Joi from 'joi';

const router = Router();
const controller = new ChatController();

const createSessionSchema = Joi.object({
  title: Joi.string().max(200).optional(),
  model: Joi.string().optional(),
});

const sendMessageSchema = Joi.object({
  content: Joi.string().min(1).max(10000).required(),
});

router.use(authenticate);

router.get('/sessions', controller.getSessions);
router.post('/sessions', validate(createSessionSchema), controller.createSession);
router.get('/sessions/:sessionId', controller.getSession);
router.delete('/sessions/:sessionId', controller.deleteSession);

router.get('/sessions/:sessionId/messages', controller.getMessages);
router.post(
  '/sessions/:sessionId/messages',
  rateLimiter,
  validate(sendMessageSchema),
  controller.sendMessage,
);

router.post('/sessions/:sessionId/stream', rateLimiter, controller.streamMessage);

export default router;
