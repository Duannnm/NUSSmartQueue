import React, { useState } from 'react';
import { signOut, User } from 'firebase/auth';
import { auth } from '../firebase';
import LocationDisplay from './LocationDisplay';
import RecommendationEngine from './RecommendationEngine';
import { MapPin, List, Target, Settings } from 'lucide-react';

interface StudentDashboardProps {
  onNavigate: (page: string) => void;
  user: User | null;
}

// Enhanced mock data with more realistic information
const mockStalls = [
  {
    id: 'western-deck',
    name: 'Western Cuisine',
    canteen: 'The Deck',
    queueLength: 5,
    estimatedWait: 12,
    category: 'Western',
    isOpen: true,
    rating: 4.2,
    priceRange: 'Medium',
    distance: 150,
    walkingTime: 2,
  },
  {
    id: 'asian-deck',
    name: 'Asian Delights',
    canteen: 'The Deck',
    queueLength: 8,
    estimatedWait: 18,
    category: 'Asian',
    isOpen: true,
    rating: 4.5,
    priceRange: 'Low',
    distance: 160,
    walkingTime: 2,
  },
  {
    id: 'healthy-techno',
    name: 'Healthy Bowl',
    canteen: 'Techno Edge',
    queueLength: 3,
    estimatedWait: 8,
    category: 'Healthy',
    isOpen: true,
    rating: 4.0,
    priceRange: 'High',
    distance: 320,
    walkingTime: 4,
  },
  {
    id: 'local-arts',
    name: 'Local Favorites',
    canteen: 'Arts Canteen',
    queueLength: 12,
    estimatedWait: 25,
    category: 'Local',
    isOpen: true,
    rating: 4.3,
    priceRange: 'Low',
    distance: 450,
    walkingTime: 6,
  },
  {
    id: 'japanese-fine',
    name: 'Japanese Corner',
    canteen: 'Fine Food',
    queueLength: 6,
    estimatedWait: 15,
    category: 'Japanese',
    isOpen: true,
    rating: 4.4,
    priceRange: 'High',
    distance: 280,
    walkingTime: 4,
  },
  {
    id: 'indian-science',
    name: 'Spice Garden',
    canteen: 'Science Canteen',
    queueLength: 4,
    estimatedWait: 10,
    category: 'Indian',
    isOpen: true,
    rating: 4.1,
    priceRange: 'Medium',
    distance: 520,
    walkingTime: 7,
  },
];

const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate, user }) => {
  const [activeTab, setActiveTab] = useState<'recommendations' | 'all-stalls' | 'location'>('recommendations');
  const [stalls] = useState(mockStalls);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('smart');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | undefined>();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onNavigate('home');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLocationUpdate = (location: { latitude: number; longitude: number }) => {
    setUserLocation(location);
  };

  const filteredAndSortedStalls = stalls
    .filter(stall => filter === 'all' || stall.category.toLowerCase() === filter)
    .sort((a, b) => {
      if (sortBy === 'wait-time') return a.estimatedWait - b.estimatedWait;
      if (sortBy === 'queue-length') return a.queueLength - b.queueLength;
      if (sortBy === 'distance') return a.distance - b.distance;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      // Smart sorting: combination of factors
      const aScore = (100 - a.estimatedWait * 2) + (100 - a.distance / 10) + (a.rating * 20);
      const bScore = (100 - b.estimatedWait * 2) + (100 - b.distance / 10) + (b.rating * 20);
      return bScore - aScore;
    });

  const getQueueStatus = (queueLength: number) => {
    if (queueLength <= 3) return { color: 'text-green-600', status: 'Low', bgColor: 'bg-green-100' };
    if (queueLength <= 8) return { color: 'text-yellow-600', status: 'Medium', bgColor: 'bg-yellow-100' };
    return { color: 'text-red-600', status: 'High', bgColor: 'bg-red-100' };
  };

  const formatDistance = (distance: number) => {
    if (distance < 1000) return `${distance}m`;
    return `${(distance / 1000).toFixed(1)}km`;
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

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'recommendations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Target className="h-4 w-4" />
              <span>Smart Recommendations</span>
            </button>
            <button
              onClick={() => setActiveTab('all-stalls')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'all-stalls'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <List className="h-4 w-4" />
              <span>All Stalls</span>
            </button>
            <button
              onClick={() => setActiveTab('location')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'location'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MapPin className="h-4 w-4" />
              <span>Location Services</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            {/* Location Display (Compact) */}
            <LocationDisplay 
              onLocationUpdate={handleLocationUpdate}
              showNearbyCanteens={false}
            />
            
            {/* Recommendation Engine */}
            <RecommendationEngine 
              userLocation={userLocation}
              onStallSelect={(stallId) => {
                console.log('Selected stall:', stallId);
                // Could navigate to stall details or add to favorites
              }}
            />
          </div>
        )}

        {activeTab === 'all-stalls' && (
          <div className="space-y-6">
            {/* Filters and Sort */}
            <div className="bg-white rounded-lg shadow-sm p-4">
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
                    <option value="japanese">Japanese</option>
                    <option value="indian">Indian</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="input-field w-auto"
                  >
                    <option value="smart">Smart Score</option>
                    <option value="wait-time">Wait Time</option>
                    <option value="queue-length">Queue Length</option>
                    <option value="distance">Distance</option>
                    <option value="rating">Rating</option>
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
                      <div className="flex-1">
                        <h3 className="stall-name">{stall.name}</h3>
                        <p className="canteen-location">{stall.canteen}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-yellow-600">★ {stall.rating}</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">{stall.priceRange}</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">{stall.category}</span>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${queueStatus.bgColor} ${queueStatus.color}`}>
                        {queueStatus.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className="text-center">
                        <div className="queue-length">{stall.queueLength}</div>
                        <div className="text-sm text-gray-600">people in queue</div>
                      </div>
                      <div className="text-center">
                        <div className="wait-time">{stall.estimatedWait} min</div>
                        <div className="text-sm text-gray-600">estimated wait</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>{formatDistance(stall.distance)} away</span>
                      <span>{stall.walkingTime} min walk</span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {stall.category}
                        </span>
                        <button className="text-xs text-blue-600 hover:text-blue-800">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'location' && (
          <div className="space-y-6">
            <LocationDisplay 
              onLocationUpdate={handleLocationUpdate}
              showNearbyCanteens={true}
            />
            
            {/* Location Services Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Enhanced Location Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Indoor Positioning</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Our advanced indoor positioning system uses WiFi and Bluetooth beacons to provide 
                    accurate location within NUS buildings, helping you find the exact stall location.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Accuracy within 5-10 meters indoors</li>
                    <li>• Seamless outdoor to indoor transition</li>
                    <li>• Real-time location updates</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Smart Recommendations</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Get personalized canteen recommendations based on your location, preferences, 
                    and real-time crowd levels.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Distance-based suggestions</li>
                    <li>• Crowd level analysis</li>
                    <li>• Walking time calculations</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Application Info */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">NUSmartQueue Enhanced Features</h3>
          <p className="text-blue-700 text-sm">
            This enhanced version includes advanced location services, intelligent recommendations, 
            and comprehensive analytics to help you make the best dining decisions on campus.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

