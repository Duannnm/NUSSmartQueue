import React, { useState } from 'react';
import { signOut, User } from 'firebase/auth';
import { auth } from '../firebase';

interface StudentDashboardProps {
  onNavigate: (page: string) => void;
  user: User | null;
}

// Mock data for demonstration
const mockStalls = [
  {
    id: '1',
    name: 'Western Cuisine',
    canteen: 'The Deck',
    queueLength: 5,
    estimatedWait: 12,
    category: 'Western',
    isOpen: true
  },
  {
    id: '2',
    name: 'Asian Delights',
    canteen: 'Fine Food',
    queueLength: 8,
    estimatedWait: 18,
    category: 'Asian',
    isOpen: true
  },
  {
    id: '3',
    name: 'Healthy Bowl',
    canteen: 'Techno Edge',
    queueLength: 3,
    estimatedWait: 8,
    category: 'Healthy',
    isOpen: true
  },
  {
    id: '4',
    name: 'Local Favorites',
    canteen: 'Arts Canteen',
    queueLength: 12,
    estimatedWait: 25,
    category: 'Local',
    isOpen: true
  }
];

const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate, user }) => {
  const [stalls] = useState(mockStalls);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('wait-time');

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onNavigate('home');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const filteredAndSortedStalls = stalls
    .filter(stall => filter === 'all' || stall.category.toLowerCase() === filter)
    .sort((a, b) => {
      if (sortBy === 'wait-time') return a.estimatedWait - b.estimatedWait;
      if (sortBy === 'queue-length') return a.queueLength - b.queueLength;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  const getQueueStatus = (queueLength: number) => {
    if (queueLength <= 3) return { color: 'text-green-600', status: 'Low' };
    if (queueLength <= 8) return { color: 'text-yellow-600', status: 'Medium' };
    return { color: 'text-red-600', status: 'High' };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
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

      {/* Filters and Sort */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Category:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input-field w-auto"
              >
                <option value="all">All Categories</option>
                <option value="western">Western</option>
                <option value="asian">Asian</option>
                <option value="local">Local</option>
                <option value="healthy">Healthy</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field w-auto"
              >
                <option value="wait-time">Wait Time</option>
                <option value="queue-length">Queue Length</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stalls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedStalls.map((stall) => {
            const queueStatus = getQueueStatus(stall.queueLength);
            return (
              <div key={stall.id} className="queue-card">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="stall-name">{stall.name}</h3>
                    <p className="canteen-location">{stall.canteen}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full bg-gray-100 ${queueStatus.color}`}>
                    {queueStatus.status}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <div className="queue-length">{stall.queueLength}</div>
                    <div className="text-sm text-gray-600">people in queue</div>
                  </div>
                  <div className="text-right">
                    <div className="wait-time">{stall.estimatedWait} min</div>
                    <div className="text-sm text-gray-600">estimated wait</div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {stall.category}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Application Info */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">NUSmartQueue Features</h3>
          <p className="text-blue-700 text-sm">
            This application demonstrates real-time queue management for NUS canteens. 
            Queue data is updated live by vendors and displayed here for students to make informed dining decisions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

