import mongoose, { Document, Schema } from 'mongoose';

export interface IBreach {
  name: string;
  domain?: string;
  breachDate?: string;
  description?: string;
  severity?: 'low' | 'medium' | 'high';
}

export interface IEmailCheck extends Document {
  email: string;
  isBreached: boolean;
  breaches: IBreach[];
  checkSource: 'manual' | 'import' | 'system';
  lastChecked: Date;
  createdAt: Date;
  updatedAt: Date;
}

const breachSchema = new Schema<IBreach>({
  name: { type: String, required: true },
  domain: String,
  breachDate: String,
  description: String,
  severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
}, { _id: false });

const emailCheckSchema = new Schema<IEmailCheck>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  isBreached: {
    type: Boolean,
    required: true,
    index: true
  },
  breaches: [breachSchema],
  checkSource: {
    type: String,
    enum: ['manual', 'import', 'system'],
    default: 'manual'
  },
  lastChecked: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for better query performance
emailCheckSchema.index({ isBreached: 1, lastChecked: -1 });
emailCheckSchema.index({ email: 1, isBreached: 1 });

export default mongoose.model<IEmailCheck>('EmailCheck', emailCheckSchema);
