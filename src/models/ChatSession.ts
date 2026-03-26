import mongoose, { Schema, Document } from 'mongoose';

// Mongoose model for storing raw LLM generation metadata alongside Prisma records
export interface IChatGenerationDocument extends Document {
  sessionId: string;
  messageId: string;
  aiModel: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostCents: number;
  latencyMs: number;
  createdAt: Date;
}

const ChatGenerationSchema = new Schema<IChatGenerationDocument>(
  {
    sessionId: { type: String, required: true, index: true },
    messageId: { type: String, required: true, unique: true },
    aiModel: { type: String, required: true },
    promptTokens: { type: Number, default: 0 },
    completionTokens: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
    estimatedCostCents: { type: Number, default: 0 },
    latencyMs: { type: Number, default: 0 },
  },
  { timestamps: true },
);

ChatGenerationSchema.index({ sessionId: 1, createdAt: -1 });

export const ChatGeneration = mongoose.model<IChatGenerationDocument>(
  'ChatGeneration',
  ChatGenerationSchema,
);
