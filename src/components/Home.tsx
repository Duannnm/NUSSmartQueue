import React from 'react';

interface HomeProps {
  onNavigate: (page: string) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">NUSmartQueue</h1>
        <p className="text-gray-600 mb-8">Manage your dining experience at NUS</p>
        
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">I am a:</h2>
            <div className="space-y-3">
              <button
                onClick={() => onNavigate('login')}
                className="btn-primary w-full"
              >
                Student
              </button>
              <button
                onClick={() => onNavigate('login')}
                className="btn-secondary w-full"
              >
                Vendor
              </button>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">New to NUSmartQueue?</p>
            <button
              onClick={() => onNavigate('signup')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Create an Account
            </button>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Demo Mode</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>This application includes demo data for testing purposes.</p>
            <p>Create an account or use the login functionality to explore features.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

