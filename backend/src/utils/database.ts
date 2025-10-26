import mongoose from 'mongoose';
import BreachRecord from '../models/BreachDatabase';
import EmailCheck from '../models/EmailCheck';

export async function connectDB(): Promise<void> {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/email_breach_checker';
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Initialize with sample breach data if database is empty
    await initializeSampleData();
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function initializeSampleData(): Promise<void> {
  try {
    const breachRecordCount = await BreachRecord.countDocuments();
    
    if (breachRecordCount === 0) {
      console.log('📥 Initializing database with sample breach data...');
      
      const sampleBreaches = [
        {
          email: 'test@example.com',
          breachName: 'Adobe Breach 2013',
          domain: 'adobe.com',
          breachDate: new Date('2013-10-04'),
          compromisedData: ['email', 'password', 'username'],
          severity: 'high' as const,
          description: '153 million user records exposed including email addresses and encrypted passwords',
          source: 'sample'
        },
        {
          email: 'test@example.com',
          breachName: 'LinkedIn Breach 2012',
          domain: 'linkedin.com',
          breachDate: new Date('2012-06-05'),
          compromisedData: ['email', 'password'],
          severity: 'high' as const,
          description: '165 million email and password combinations exposed',
          source: 'sample'
        },
        {
          email: 'user@gmail.com',
          breachName: 'Yahoo Breach 2013',
          domain: 'yahoo.com',
          breachDate: new Date('2013-08-01'),
          compromisedData: ['email', 'password', 'username', 'phone'],
          severity: 'high' as const,
          description: '3 billion accounts compromised in one of the largest breaches in history',
          source: 'sample'
        },
        {
          email: 'compromised@yahoo.com',
          breachName: 'Yahoo Breach 2013',
          domain: 'yahoo.com',
          breachDate: new Date('2013-08-01'),
          compromisedData: ['email', 'password', 'username'],
          severity: 'high' as const,
          source: 'sample'
        },
        {
          email: 'hacked@gmail.com',
          breachName: 'Facebook Breach 2019',
          domain: 'facebook.com',
          breachDate: new Date('2019-09-01'),
          compromisedData: ['email', 'phone', 'username'],
          severity: 'medium' as const,
          description: '533 million users had phone numbers and personal data exposed',
          source: 'sample'
        },
        {
          email: 'breached@hotmail.com',
          breachName: 'Microsoft Hotmail Leak 2019',
          domain: 'hotmail.com',
          breachDate: new Date('2019-12-01'),
          compromisedData: ['email'],
          severity: 'low' as const,
          description: 'Email addresses exposed in configuration error',
          source: 'sample'
        }
        {
          email: 'sanjeetchougule@gmail.com',
          breachName: 'Microsoft Hotmail Leak 2019',
          domain: 'hotmail.com',
          breachDate: new Date('2019-12-01'),
          compromisedData: ['email'],
          severity: 'low' as const,
          description: 'Email addresses exposed in configuration error',
          source: 'sample'
        }
      ];
      
      await BreachRecord.insertMany(sampleBreaches);
      console.log(`✅ Added ${sampleBreaches.length} sample breach records`);
    }
    
    // Pre-populate some email checks for demo
    const emailCheckCount = await EmailCheck.countDocuments();
    if (emailCheckCount === 0) {
      const sampleChecks = [
        {
          email: 'test@example.com',
          isBreached: true,
          breaches: [
            { name: 'Adobe Breach 2013', domain: 'adobe.com', breachDate: '2013-10-04', severity: 'high' },
            { name: 'LinkedIn Breach 2012', domain: 'linkedin.com', breachDate: '2012-06-05', severity: 'high' }
          ],
          checkSource: 'import' as const
        },
        {
          email: 'safe@example.com',
          isBreached: false,
          breaches: [],
          checkSource: 'manual' as const
        }
      ];
      
      await EmailCheck.insertMany(sampleChecks);
      console.log('✅ Added sample email check records');
    }
    
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
}
