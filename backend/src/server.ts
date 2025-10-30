import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.options('*', cors());

// Complete in-memory breach database
const breachDatabase: { [email: string]: Array<{
  name: string;
  domain: string;
  breachDate: string;
  description?: string;
  severity: 'low' | 'medium' | 'high';
}> } = {
  'sanjeet.chougule23@spit.ac.in': [
    {
      name: 'Adobe Breach 2013',
      domain: 'adobe.com',
      breachDate: '2013-10-04',
      description: '153 million user records exposed including email addresses and encrypted passwords',
      severity: 'high'
    },
    {
      name: 'LinkedIn Breach 2012',
      domain: 'linkedin.com',
      breachDate: '2012-06-05',
      description: '165 million email and password combinations exposed',
      severity: 'high'
    }
  ],
  'user@gmail.com': [
    {
      name: 'Yahoo Breach 2013',
      domain: 'yahoo.com',
      breachDate: '2013-08-01',
      description: '3 billion accounts compromised in one of the largest breaches in history',
      severity: 'high'
    }
  ],
  'sanjeetchougule@gmail.com': [
    {
      name: 'gmail Breach 2013',
      domain: 'gmail.com',
      breachDate: '2013-08-01',
      description: '3 billion accounts compromised in one of the largest breaches in history',
      severity: 'high'
    }
  ],
  'compromised@yahoo.com': [
    {
      name: 'Yahoo Breach 2013',
      domain: 'yahoo.com',
      breachDate: '2013-08-01',
      severity: 'high'
    }
  ],
  'hacked@gmail.com': [
    {
      name: 'Facebook Breach 2019',
      domain: 'facebook.com',
      breachDate: '2019-09-01',
      description: '533 million users had phone numbers and personal data exposed',
      severity: 'medium'
    }
  ],
  'breached@hotmail.com': [
    {
      name: 'Microsoft Hotmail Leak 2019',
      domain: 'hotmail.com',
      breachDate: '2019-12-01',
      description: 'Email addresses exposed in configuration error',
      severity: 'low'
    }
  ],
  'leaked@protonmail.com': [
    {
      name: 'Data Aggregator Leak 2021',
      domain: 'multiple',
      breachDate: '2021-03-15',
      description: 'Personal data collected from multiple sources and sold online',
      severity: 'medium'
    }
  ],
  'pwned@outlook.com': [
    {
      name: 'Social Media Scrape 2022',
      domain: 'social-media.com',
      breachDate: '2022-07-20',
      description: 'Data scraped from social media platforms',
      severity: 'low'
    }
  ]
};

// Safe emails (no breaches)
const safeEmails = [
  'safe@example.com',
  'secure@gmail.com',
  'protected@yahoo.com',
  'private@outlook.com'
];

// Check if email is in our breach database
function checkEmailInDatabase(email: string): { found: boolean; breaches: any[] } {
  const normalizedEmail = email.toLowerCase().trim();
  const breaches = breachDatabase[normalizedEmail] || [];
  
  return {
    found: breaches.length > 0,
    breaches: breaches
  };
}

interface BreachResponse {
  success: boolean;
  found: boolean;
  breaches: any[];
  note: string;
  source: string;
  totalBreaches?: number;
}

// Check email endpoint
app.post('/api/check-email', async (req: Request, res: Response) => {
  const { email } = req.body as { email?: string };
  
  if (!email) {
    return res.status(400).json({ 
      success: false, 
      error: 'Email is required' 
    });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Please enter a valid email address' 
    });
  }

  try {
    console.log(`🔍 Checking email: ${email}`);
    
    const { found, breaches } = checkEmailInDatabase(email);
    
    const result: BreachResponse = {
      success: true,
      found,
      breaches,
      totalBreaches: breaches.length,
      note: found 
        ? `Found in ${breaches.length} data breach${breaches.length > 1 ? 'es' : ''}` 
        : 'No breaches found - your email appears to be safe',
      source: 'breach-database'
    };

    res.json(result);
  } catch (e: unknown) {
    const err = e as Error;
    console.error('Email check error:', err.message);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Get statistics
app.get('/api/stats', async (req: Request, res: Response) => {
  try {
    const breachedEmails = Object.keys(breachDatabase);
    const totalBreachedEmails = breachedEmails.length;
    const totalSafeEmails = safeEmails.length;
    const totalEmails = totalBreachedEmails + totalSafeEmails;
    
    const totalBreaches = Object.values(breachDatabase).reduce(
      (sum, breaches) => sum + breaches.length, 0
    );

    // Count breaches by severity
    const severityCounts = { high: 0, medium: 0, low: 0 };
    Object.values(breachDatabase).forEach(breaches => {
      breaches.forEach(breach => {
        severityCounts[breach.severity]++;
      });
    });

    // Count breaches by domain
    const domainCounts: { [domain: string]: number } = {};
    Object.values(breachDatabase).forEach(breaches => {
      breaches.forEach(breach => {
        domainCounts[breach.domain] = (domainCounts[breach.domain] || 0) + 1;
      });
    });

    const topDomains = Object.entries(domainCounts)
      .map(([_id, count]) => ({ _id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        totalEmails,
        breachedEmails: totalBreachedEmails,
        safeEmails: totalSafeEmails,
        recentChecks: totalEmails,
        totalBreachRecords: totalBreaches,
        uniqueBreachedEmails: totalBreachedEmails,
        breachPercentage: totalEmails > 0 ? ((totalBreachedEmails / totalEmails) * 100).toFixed(2) : '0.00',
        severityCounts,
        topDomains
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch statistics' 
    });
  }
});

// Health check endpoint
app.get('/api/health', async (req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    message: 'Email Breach Checker API is running',
    database: 'in-memory',
    stats: {
      emailChecks: Object.keys(breachDatabase).length + safeEmails.length,
      breachRecords: Object.values(breachDatabase).reduce((sum, b) => sum + b.length, 0),
      breachedEmails: Object.keys(breachDatabase).length,
      safeEmails: safeEmails.length
    },
    timestamp: new Date().toISOString()
  });
});

// Get all breach data (for debugging)
app.get('/api/debug/breaches', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: breachDatabase,
    safeEmails: safeEmails
  });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Email Breach Checker API',
    version: '1.0.0',
    port: PORT,
    database: 'in-memory',
    endpoints: {
      'POST /api/check-email': 'Check if email is breached',
      'GET /api/stats': 'Get database statistics',
      'GET /api/health': 'Health check',
      'GET /api/debug/breaches': 'View all breach data'
    },
    testEmails: {
      breached: Object.keys(breachDatabase),
      safe: safeEmails
    }
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📧 Email Breach Checker API is ready!`);
  console.log(`🌐 Frontend: http://localhost:5173`);
  console.log(`🔗 Backend: http://localhost:${PORT}`);
  console.log(`💾 Using in-memory database`);
  console.log(`📊 ${Object.keys(breachDatabase).length} breached emails loaded`);
  console.log(`🛡️  ${safeEmails.length} safe emails loaded`);
  console.log(`\n🧪 Test with these emails:`);
  console.log(`   Breached: test@example.com, hacked@gmail.com, user@gmail.com`);
  console.log(`   Safe: safe@example.com, secure@gmail.com`);
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is in use. Try another: PORT=8001 npm run dev`);
  } else {
    console.error('Server error:', err.message);
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});
