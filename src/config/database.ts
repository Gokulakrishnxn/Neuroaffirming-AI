import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';
import { env } from './environment';
import { logger } from '../utils/logger';

// ─── Prisma (PostgreSQL) ──────────────────────────────────

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.isDev ? ['query', 'error', 'warn'] : ['error'],
  });

if (env.isDev) globalForPrisma.prisma = prisma;

export async function connectPostgres(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('PostgreSQL connected via Prisma');
  } catch (error) {
    logger.error('PostgreSQL connection failed', { error });
    throw error;
  }
}

export async function disconnectPostgres(): Promise<void> {
  await prisma.$disconnect();
  logger.info('PostgreSQL disconnected');
}

// ─── Mongoose (MongoDB) ───────────────────────────────────

export async function connectMongo(): Promise<void> {
  try {
    mongoose.set('strictQuery', true);

    mongoose.connection.on('connected', () =>
      logger.info('MongoDB connected'),
    );
    mongoose.connection.on('error', (err) =>
      logger.error('MongoDB error', { err }),
    );
    mongoose.connection.on('disconnected', () =>
      logger.warn('MongoDB disconnected'),
    );

    await mongoose.connect(env.mongodbUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  } catch (error) {
    logger.error('MongoDB connection failed', { error });
    throw error;
  }
}

export async function disconnectMongo(): Promise<void> {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
}

// ─── Connect all databases ────────────────────────────────

export async function connectDatabases(): Promise<void> {
  await Promise.all([connectPostgres(), connectMongo()]);
}

export async function disconnectDatabases(): Promise<void> {
  await Promise.all([disconnectPostgres(), disconnectMongo()]);
}
