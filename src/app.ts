import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { env } from './config/environment';
import { requestLogger } from './middleware/requestLogger';
import { rateLimiter } from './middleware/rateLimiter';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import routes from './routes';
import { logger } from './utils/logger';

export function createApp(): { app: Application; httpServer: ReturnType<typeof createServer> } {
  const app = express();

  // ─── Security headers ──────────────────────────────────
  app.use(helmet());
  app.set('trust proxy', 1);

  // ─── CORS ──────────────────────────────────────────────
  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin || env.cors.allowedOrigins.includes(origin)) {
          cb(null, true);
        } else {
          cb(new Error(`CORS: origin ${origin} not allowed`));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  // ─── Body parsers ──────────────────────────────────────
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());
  app.use(compression());

  // ─── Request logging ───────────────────────────────────
  app.use(requestLogger);

  // ─── Global rate limit ─────────────────────────────────
  app.use(rateLimiter);

  // ─── Routes ────────────────────────────────────────────
  app.use(`/api/${env.apiVersion}`, routes);

  // ─── 404 & error handlers ──────────────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  // ─── Socket.IO ─────────────────────────────────────────
  const httpServer = createServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.cors.allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/socket.io',
  });

  io.on('connection', (socket) => {
    logger.info('Socket connected', { socketId: socket.id });

    socket.on('join:session', (sessionId: string) => {
      socket.join(`session:${sessionId}`);
      logger.info('Socket joined session', { socketId: socket.id, sessionId });
    });

    socket.on('disconnect', () => {
      logger.info('Socket disconnected', { socketId: socket.id });
    });
  });

  // Make io available to request handlers
  app.set('io', io);

  return { app, httpServer };
}
