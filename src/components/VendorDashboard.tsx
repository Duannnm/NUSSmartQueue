import React, { useState } from 'react';
import { signOut, User } from 'firebase/auth';
import { auth } from '../firebase';
import VendorAnalytics from './VendorAnalytics';
import { BarChart3, Settings, TrendingUp } from 'lucide-react';

interface VendorDashboardProps {
  onNavigate: (page: string) => void;
  user: User | null;
}

const VendorDashboard: React.FC<VendorDashboardProps> = ({ onNavigate, user }) => {
  const [activeTab, setActiveTab] = useState<'management' | 'analytics'>('management');
  const [stallData, setStallData] = useState({
    stallId: 'western-cuisine-deck',
    stallName: 'Western Cuisine',
    canteen: 'The Deck',
    queueLength: 5,
    isOpen: true,
    averageServiceTime: 2.5
  });

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onNavigate('home');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateQueue = (change: number) => {
    setStallData(prev => ({
      ...prev,
      queueLength: Math.max(0, prev.queueLength + change)
    }));
  };

  const toggleStallStatus = () => {
    setStallData(prev => ({
      ...prev,
      isOpen: !prev.isOpen
    }));
  };

  const estimatedWaitTime = stallData.queueLength * stallData.averageServiceTime;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="btn-secondary"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('management')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'management'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>Queue Management</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'management' && (
          <div className="space-y-6">
            {/* Stall Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Stall Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Stall Name</p>
                  <p className="text-lg font-medium">{stallData.stallName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="text-lg font-medium">{stallData.canteen}</p>
                </div>
              </div>
            </div>

            {/* Queue Management */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Queue Management</h2>
              
              {/* Status Toggle */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium">Stall Status</span>
                  <button
                    onClick={toggleStallStatus}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      stallData.isOpen
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    {stallData.isOpen ? 'Open' : 'Closed'}
                  </button>
                </div>
              </div>

              {/* Queue Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-700 mb-4">Current Queue</h3>
                  <div className="queue-length text-4xl mb-4">{stallData.queueLength}</div>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => updateQueue(-1)}
                      disabled={stallData.queueLength === 0}
                      className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded-lg"
                    >
                      -1
                    </button>
                    <button
                      onClick={() => updateQueue(1)}
                      className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg"
                    >
                      +1
                    </button>
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-700 mb-4">Estimated Wait Time</h3>
                  <div className="wait-time text-3xl mb-4">{Math.round(estimatedWaitTime)} min</div>
                  <p className="text-sm text-gray-600">
                    Based on {stallData.averageServiceTime} min per customer
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => setStallData(prev => ({ ...prev, queueLength: 0 }))}
                  className="btn-secondary text-center py-3"
                >
                  Clear Queue
                </button>
                <button
                  onClick={() => updateQueue(5)}
                  className="btn-secondary text-center py-3"
                >
                  +5 People
                </button>
                <button
                  onClick={() => updateQueue(-5)}
                  className="btn-secondary text-center py-3"
                >
                  -5 People
                </button>
                <button
                  onClick={() => setStallData(prev => ({ ...prev, queueLength: 10 }))}
                  className="btn-secondary text-center py-3"
                >
                  Set to 10
                </button>
              </div>
            </div>

            {/* Analytics Preview */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Performance Analytics</h3>
                  <p className="text-gray-600">
                    View detailed insights about your stall's performance, customer patterns, and optimization recommendations.
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    View Analytics
                  </button>
                </div>
              </div>
            </div>

            {/* Application Info */}
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">Queue Management System</h3>
              <p className="text-yellow-700 text-sm">
                Use the controls above to update your stall's queue information. 
                Changes will be reflected in real-time for students viewing the queue status.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <VendorAnalytics stallId={stallData.stallId} stallName={stallData.stallName} />
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;

