import mongoose, { Schema, Document } from 'mongoose';

// Mongoose model for unstructured user data (e.g. analytics, session metadata)
export interface IUserDocument extends Document {
  userId: string;        // references Prisma User.id
  sessionCount: number;
  lastActiveAt: Date;
  tags: string[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    sessionCount: { type: Number, default: 0 },
    lastActiveAt: { type: Date, default: Date.now },
    tags: { type: [String], default: [] },
    notes: { type: String, default: '' },
  },
  { timestamps: true },
);

export const UserMeta = mongoose.model<IUserDocument>('UserMeta', UserSchema);
