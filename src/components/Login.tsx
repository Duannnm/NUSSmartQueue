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

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Login to NUSmartQueue</h2>
        
        <div className="mb-4 p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-700 mb-2">Demo Accounts (for testing):</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fillDemoCredentials('student')}
              className="text-xs bg-green-100 hover:bg-green-200 text-green-800 px-2 py-1 rounded"
            >
              Student Demo
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('vendor')}
              className="text-xs bg-green-100 hover:bg-green-200 text-green-800 px-2 py-1 rounded"
            >
              Vendor Demo
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

