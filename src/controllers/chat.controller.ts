import { Response, NextFunction } from 'express';
import { ChatService } from '../services/chat.service';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/apiResponse';

const chatService = new ChatService();

export class ChatController {
  getSessions = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sessions = await chatService.getSessions(req.user!.id);
      sendSuccess(res, sessions);
    } catch (err) {
      next(err);
    }
  };

  createSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const session = await chatService.createSession(req.user!.id, req.body);
      sendCreated(res, session, 'Chat session created');
    } catch (err) {
      next(err);
    }
  };

  getSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const session = await chatService.getSession(req.params.sessionId, req.user!.id);
      sendSuccess(res, session);
    } catch (err) {
      next(err);
    }
  };

  deleteSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await chatService.deleteSession(req.params.sessionId, req.user!.id);
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  };

  getMessages = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const messages = await chatService.getMessages(req.params.sessionId, req.user!.id);
      sendSuccess(res, messages);
    } catch (err) {
      next(err);
    }
  };

  sendMessage = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await chatService.sendMessage(
        req.params.sessionId,
        req.user!.id,
        req.body.content,
      );
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  };

  streamMessage = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      await chatService.streamMessage(
        req.params.sessionId,
        req.user!.id,
        req.body.content,
        res,
      );
    } catch (err) {
      next(err);
    }
  };
}
