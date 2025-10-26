import mongoose, { Document, Schema } from 'mongoose';

export interface IBreachRecord extends Document {
  email: string;
  breachName: string;
  domain: string;
  breachDate: Date;
  compromisedData: string[];
  severity: 'low' | 'medium' | 'high';
  description?: string;
  source: string;
  discoveredAt: Date;
}

const breachRecordSchema = new Schema<IBreachRecord>({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  breachName: {
    type: String,
    required: true,
    index: true
  },
  domain: {
    type: String,
    required: true
  },
  breachDate: {
    type: Date,
    required: true
  },
  compromisedData: [{
    type: String,
    enum: ['email', 'password', 'username', 'phone', 'address', 'credit_card', 'social_security']
  }],
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  description: String,
  source: {
    type: String,
    default: 'system'
  },
  discoveredAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound indexes
breachRecordSchema.index({ email: 1, breachName: 1 });
breachRecordSchema.index({ domain: 1, breachDate: -1 });

export default mongoose.model<IBreachRecord>('BreachRecord', breachRecordSchema);
