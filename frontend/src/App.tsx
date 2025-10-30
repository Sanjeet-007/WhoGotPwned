import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, Search, Loader2, Eye, EyeOff, Database, BarChart3 } from 'lucide-react';

interface Breach {
  name?: string;
  domain?: string;
  breachDate?: string;
  description?: string;
  severity?: 'low' | 'medium' | 'high';
}

interface BreachResult {
  success: boolean;
  found?: boolean;
  breaches?: Breach[];
  error?: string;
  note?: string;
  fromCache?: boolean;
  totalBreaches?: number;
}

interface Stats {
  totalEmails: number;
  breachedEmails: number;
  safeEmails: number;
  recentChecks: number;
  totalBreachRecords: number;
  uniqueBreachedEmails: number;
  breachPercentage: string;
  topDomains: Array<{ _id: string; count: number }>;
}

function App() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<BreachResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showBreaches, setShowBreaches] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  const API_BASE_URL = '/api'; // Use proxy

  const checkEmailBreach = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/check-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error checking email:', error);
      setResult({
        success: false,
        error: 'Failed to check email. Please make sure the backend server is running.'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/stats`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setStats(data.data);
        setShowStats(true);
      } else {
        throw new Error(data.error || 'Failed to fetch stats');
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      alert('Failed to fetch statistics. Please check if the backend server is running on port 5000.');
    } finally {
      setStatsLoading(false);
    }
  };

  const getStatusColor = () => {
    if (!result || !result.success) return 'text-gray-500';
    return result.found ? 'text-red-500' : 'text-green-500';
  };

  const getStatusIcon = () => {
    if (!result || !result.success) return null;
    
    return result.found ? (
      <AlertTriangle className="w-8 h-8 text-red-500" />
    ) : (
      <CheckCircle className="w-8 h-8 text-green-500" />
    );
  };

  const getStatusText = () => {
    if (!result) return '';
    if (!result.success) return 'Error occurred';
    return result.found ? 'Compromised' : 'Secure';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-6">
            <div className="glass-effect p-4 rounded-2xl">
              <Shield className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
            WhoGotPwned
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Check if your email has been compromised in our breach database. 
            All data is stored locally in MongoDB - no external APIs.
          </p>
        </div>

        {/* Stats Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={fetchStats}
            disabled={statsLoading}
            className="glass-effect text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50"
          >
            {statsLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <BarChart3 className="w-5 h-5" />
            )}
            <span>{statsLoading ? 'Loading...' : 'View Database Stats'}</span>
          </button>
        </div>

        {/* Stats Modal */}
        {showStats && stats && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="glass-effect rounded-2xl p-8 max-w-md w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center">
                  <Database className="w-6 h-6 mr-2" />
                  Database Statistics
                </h3>
                <button
                  onClick={() => setShowStats(false)}
                  className="text-gray-400 hover:text-white text-xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Emails Checked:</span>
                  <span className="text-white font-bold">{stats.totalEmails}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Breached Emails:</span>
                  <span className="text-red-400 font-bold">{stats.breachedEmails}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Safe Emails:</span>
                  <span className="text-green-400 font-bold">{stats.safeEmails}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Breach Percentage:</span>
                  <span className="text-yellow-400 font-bold">{stats.breachPercentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Breach Records:</span>
                  <span className="text-blue-400 font-bold">{stats.totalBreachRecords}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Recent Checks (24h):</span>
                  <span className="text-purple-400 font-bold">{stats.recentChecks}</span>
                </div>
                
                {stats.topDomains && stats.topDomains.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-white font-semibold mb-2">Top Breached Domains:</h4>
                    <div className="space-y-1">
                      {stats.topDomains.map((domain, index) => (
                        <div key={domain._id} className="flex justify-between text-sm">
                          <span className="text-gray-300">{domain._id}</span>
                          <span className="text-gray-400">{domain.count} breaches</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          {/* Search Card */}
          <div className="glass-effect rounded-2xl p-8 mb-8 shadow-2xl">
            <form onSubmit={checkEmailBreach} className="space-y-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address to check..."
                  className="w-full pl-10 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Checking Database...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    <span>Check Security Status</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results Card */}
          {result && (
            <div className="glass-effect rounded-2xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  {getStatusIcon()}
                  <div>
                    <h3 className="text-2xl font-bold text-white">Security Status</h3>
                    <p className={`text-lg font-semibold ${getStatusColor()}`}>
                      {getStatusText()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-300">Email Checked</p>
                  <p className="text-white font-medium">{email}</p>
                </div>
              </div>

              {result.note && (
                <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-blue-300 text-sm">{result.note}</p>
                  {result.fromCache && (
                    <p className="text-blue-400/80 text-xs mt-1">✓ Served from cache</p>
                  )}
                </div>
              )}

              {!result.success ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <p className="text-red-300 text-center">
                    {result.error || 'An error occurred while checking your email.'}
                  </p>
                </div>
              ) : result.found ? (
                <div className="space-y-4">
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <AlertTriangle className="w-6 h-6 text-red-400" />
                      <h4 className="text-xl font-semibold text-white">Security Alert</h4>
                    </div>
                    <p className="text-red-300 mb-4">
                      Your email was found in {result.totalBreaches || result.breaches?.length || 0} data breach(es). 
                      It's recommended to change your passwords immediately.
                    </p>
                    
                    {result.breaches && result.breaches.length > 0 && (
                      <div>
                        <button
                          onClick={() => setShowBreaches(!showBreaches)}
                          className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors"
                        >
                          {showBreaches ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                          <span>
                            {showBreaches ? 'Hide' : 'Show'} Breach Details
                          </span>
                        </button>
                        
                        {showBreaches && (
                          <div className="mt-4 space-y-3">
                            {result.breaches.map((breach: any, index: number) => (
                              <div
                                key={index}
                                className="bg-red-500/5 border border-red-500/10 rounded-lg p-4"
                              >
                                <div className="flex justify-between items-start">
                                  <p className="text-red-300 font-medium">
                                    {breach.name || 'Unknown Breach'}
                                  </p>
                                  {breach.severity && (
                                    <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(breach.severity)} bg-opacity-20`}>
                                      {breach.severity}
                                    </span>
                                  )}
                                </div>
                                {breach.domain && (
                                  <p className="text-red-400/80 text-sm">Domain: {breach.domain}</p>
                                )}
                                {breach.breachDate && (
                                  <p className="text-red-400/80 text-sm">
                                    Date: {new Date(breach.breachDate).toLocaleDateString()}
                                  </p>
                                )}
                                {breach.description && (
                                  <p className="text-red-400/80 text-sm mt-1">{breach.description}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <h4 className="text-xl font-semibold text-white">All Clear!</h4>
                  </div>
                  <p className="text-green-300 mt-2">
                    Your email address was not found in any known data breaches in our database. 
                    Continue practicing good security habits to stay protected.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Security Tips */}
          <div className="glass-effect rounded-2xl p-8 mt-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              Security Tips
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white">Use Strong Passwords</h4>
                  <p className="text-gray-300 text-sm">
                    Create unique, complex passwords for each account
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Database className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white">Local Database</h4>
                  <p className="text-gray-300 text-sm">
                    All data stored locally in MongoDB - no external APIs
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-12">
          <p className="text-gray-400">
            Powered by WhoGotPwned • Your privacy matters
          </p>
        </footer>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        .glass-effect {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}

export default App;