import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

interface LoginProps {
  onNavigate: (page: string) => void;
}

const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check for demo accounts first
      if (email === 'demo.student@nus.edu.sg' && password === 'DemoStudent123') {
        // Simulate successful login for demo student
        setLoading(false);
        onNavigate('student-dashboard');
        return;
      }
      
      if (email === 'demo.vendor@nus.edu.sg' && password === 'DemoVendor123') {
        // Simulate successful login for demo vendor
        setLoading(false);
        onNavigate('vendor-dashboard');
        return;
      }

      // For non-demo accounts, use Firebase authentication
      await signInWithEmailAndPassword(auth, email, password);
      // Navigation will be handled by the auth state change in App.tsx
    } catch (error: any) {
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (type: 'student' | 'vendor') => {
    if (type === 'student') {
      setEmail('demo.student@nus.edu.sg');
      setPassword('DemoStudent123');
    } else {
      setEmail('demo.vendor@nus.edu.sg');
      setPassword('DemoVendor123');
    }
  };

  const handleDemoLogin = (type: 'student' | 'vendor') => {
    setLoading(true);
    setError('');
    
    // Simulate loading time for better UX
    setTimeout(() => {
      setLoading(false);
      if (type === 'student') {
        onNavigate('student-dashboard');
      } else {
        onNavigate('vendor-dashboard');
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Login to NUSmartQueue</h2>
        
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <p className="text-sm font-medium text-gray-700 mb-3">🚀 Quick Demo Access:</p>
          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('student')}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading...' : '👨‍🎓 Student Demo'}
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('vendor')}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading...' : '🏪 Vendor Demo'}
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-2 text-center">
            Experience all features with realistic demo data
          </p>
        </div>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or login with credentials</span>
          </div>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Demo Credentials:</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fillDemoCredentials('student')}
              className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded"
            >
              Fill Student
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('vendor')}
              className="text-xs bg-green-100 hover:bg-green-200 text-green-800 px-2 py-1 rounded"
            >
              Fill Vendor
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => onNavigate('home')}
            className="text-gray-600 hover:text-gray-800 mr-4"
          >
            ← Back to Home
          </button>
          <button
            onClick={() => onNavigate('signup')}
            className="text-blue-600 hover:text-blue-800"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;

