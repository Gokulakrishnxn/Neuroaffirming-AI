import { env } from './config/environment';
import { connectDatabases, disconnectDatabases } from './config/database';
import { createApp } from './app';
import { logger } from './utils/logger';

async function bootstrap(): Promise<void> {
  try {
    await connectDatabases();

    const { httpServer } = createApp();

    httpServer.listen(env.port, () => {
      logger.info(`🌸 BLOOM API running`, {
        port: env.port,
        env: env.nodeEnv,
        url: `http://localhost:${env.port}/api/${env.apiVersion}`,
      });
    });

    // ─── Graceful shutdown ─────────────────────────────
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received — shutting down gracefully`);
      httpServer.close(async () => {
        await disconnectDatabases();
        logger.info('Server closed');
        process.exit(0);
      });

      // Force exit after 10 s
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10_000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('uncaughtException', (err) => {
      logger.error('Uncaught exception', { error: err });
      process.exit(1);
    });

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled rejection', { reason });
      process.exit(1);
    });
  } catch (err) {
    logger.error('Failed to start server', { err });
    process.exit(1);
  }
}

bootstrap();
