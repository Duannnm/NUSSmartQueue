import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  MapPin, 
  Users, 
  Star, 
  Filter,
  Utensils,
  Bus,
  RefreshCw,
  LogOut,
  ChevronRight,
  Wifi,
  AirVent,
  Car
} from 'lucide-react';
import { useGeolocation } from '../hooks/useGeolocation';
import { getRecommendations } from '../services/recommendationService';

interface EnhancedStudentDashboardProps {
  onNavigate: (page: string, data?: any) => void;
}

interface Canteen {
  id: string;
  name: string;
  location: string;
  level: string;
  cuisines: string[];
  score: number;
  totalTime: string;
  queueTime: string;
  travelTime: string;
  peopleCount: number;
  crowdLevel: 'Low' | 'Medium' | 'High';
  walkingTime: string;
  distance: string;
  averagePrice: number;
  rating: number;
  status: string[];
  operating: string;
  amenities: string[];
  isBestMatch?: boolean;
}

const EnhancedStudentDashboard: React.FC<EnhancedStudentDashboardProps> = ({ onNavigate }) => {
  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [locationFound, setLocationFound] = useState(false);
  const { location, error: locationError } = useGeolocation();

  useEffect(() => {
    // Simulate location found
    if (location) {
      setLocationFound(true);
    }

    // Load canteen data
    const mockCanteens: Canteen[] = [
      {
        id: 'com2',
        name: 'COM2 Canteen',
        location: 'COM2',
        level: 'Level 2',
        cuisines: ['Chinese', 'Malay', 'Indian'],
        score: 85,
        totalTime: '9m total',
        queueTime: '5m queue',
        travelTime: '4m travel',
        peopleCount: 3,
        crowdLevel: 'Low',
        walkingTime: '4 min walk',
        distance: '351m away',
        averagePrice: 4.5,
        rating: 4.2,
        status: ['Short queue', 'Very close', 'Not crowded'],
        operating: '08:00 - 20:00',
        amenities: ['WiFi', 'Study area'],
        isBestMatch: true
      },
      {
        id: 'arts',
        name: 'Arts Canteen',
        location: 'Faculty of Arts and Social Sciences',
        level: 'Level 1',
        cuisines: ['Chinese', 'Malay', 'Western'],
        score: 72,
        totalTime: '15m total',
        queueTime: '10m queue',
        travelTime: '5m travel',
        peopleCount: 8,
        crowdLevel: 'Medium',
        walkingTime: '5 min walk',
        distance: '420m away',
        averagePrice: 4.8,
        rating: 4.1,
        status: ['Moderate queue', 'Affordable'],
        operating: '07:30 - 19:30',
        amenities: ['WiFi', 'Air-conditioned']
      },
      {
        id: 'science',
        name: 'Science Canteen',
        location: 'Faculty of Science',
        level: 'Level 2',
        cuisines: ['Chinese', 'Malay', 'Indian'],
        score: 68,
        totalTime: '21m total',
        queueTime: '8m queue',
        travelTime: '13m travel',
        peopleCount: 5,
        crowdLevel: 'Low',
        walkingTime: '13 min walk',
        distance: '1093m away',
        averagePrice: 4.8,
        rating: 4.3,
        status: ['Not crowded', 'Affordable', 'Air-conditioned'],
        operating: '07:30 - 20:30',
        amenities: ['Air-conditioned', 'WiFi', 'Vending machines']
      },
      {
        id: 'utown',
        name: 'UTown Food Court',
        location: 'University Town',
        level: 'Level 1',
        cuisines: ['International', 'Western', 'Asian'],
        score: 65,
        totalTime: '30m total',
        queueTime: '15m queue',
        travelTime: '15m travel',
        peopleCount: 10,
        crowdLevel: 'Low',
        walkingTime: '15 min walk',
        distance: '1225m away',
        averagePrice: 7.0,
        rating: 4.4,
        status: ['Not crowded', 'Air-conditioned'],
        operating: '07:00 - 22:00',
        amenities: ['Air-conditioned', 'WiFi', 'Wheelchair accessible', 'Late night dining']
      }
    ];

    setCanteens(mockCanteens);
  }, [location]);

  const handleRefresh = () => {
    // Simulate refresh
    setIsOnline(false);
    setTimeout(() => setIsOnline(true), 1000);
  };

  const getCrowdColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-green-600';
      case 'Medium': return 'text-yellow-600';
      case 'High': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    if (status.includes('Short') || status.includes('close') || status.includes('Not crowded')) {
      return 'bg-green-100 text-green-800';
    }
    if (status.includes('Affordable') || status.includes('Air-conditioned')) {
      return 'bg-blue-100 text-blue-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
              <Utensils className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">NUSmartQueue</h1>
              <p className="text-sm text-gray-600">Smart canteen recommendations</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Online</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600">
                {locationFound ? 'Location found' : 'Finding location...'}
              </span>
            </div>
            <button 
              onClick={handleRefresh}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button 
              onClick={() => onNavigate('home')}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Welcome Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, keithloh00!</h2>
              <p className="text-gray-600">
                Here are your personalized canteen recommendations based on queue times and bus schedules.
              </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Open Canteens</p>
                    <p className="text-3xl font-bold text-gray-900">8</p>
                  </div>
                  <Utensils className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Avg Queue Time</p>
                    <p className="text-3xl font-bold text-green-600">7m</p>
                  </div>
                  <Clock className="w-8 h-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Nearby Canteens</p>
                    <p className="text-3xl font-bold text-purple-600">8</p>
                  </div>
                  <MapPin className="w-8 h-8 text-purple-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Bus Stops</p>
                    <p className="text-3xl font-bold text-orange-600">0</p>
                  </div>
                  <Bus className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Filters & Preferences</h3>
                </div>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Show Filters
                </button>
              </div>
            </div>

            {/* Canteen Recommendations */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900">Canteen Recommendations</h3>
              
              {canteens.map((canteen) => (
                <div key={canteen.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-xl font-bold text-gray-900">{canteen.name}</h4>
                        {canteen.isBestMatch && (
                          <span className="bg-black text-white px-3 py-1 rounded-full text-sm font-medium">
                            Best Match
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{canteen.location} • {canteen.level}</p>
                      
                      {/* Cuisine Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {canteen.cuisines.map((cuisine) => (
                          <span 
                            key={cuisine}
                            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                          >
                            {cuisine}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Score */}
                    <div className="text-right">
                      <div className="text-4xl font-bold text-red-500 mb-1">{canteen.score}</div>
                      <div className="text-sm text-gray-600">Score</div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-4 gap-6 mb-4">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-semibold text-gray-900">{canteen.totalTime}</p>
                        <p className="text-sm text-gray-600">{canteen.queueTime} + {canteen.travelTime}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-semibold text-gray-900">{canteen.peopleCount} people</p>
                        <p className={`text-sm ${getCrowdColor(canteen.crowdLevel)}`}>{canteen.crowdLevel}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-semibold text-gray-900">{canteen.walkingTime}</p>
                        <p className="text-sm text-gray-600">{canteen.distance}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Star className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-semibold text-gray-900">${canteen.averagePrice}</p>
                        <p className="text-sm text-gray-600">Average price</p>
                      </div>
                    </div>
                  </div>

                  {/* Status Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {canteen.status.map((status) => (
                      <span 
                        key={status}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}
                      >
                        {status}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Operating: {canteen.operating}</span>
                      <span>•</span>
                      <div className="flex items-center space-x-2">
                        {canteen.amenities.includes('WiFi') && <Wifi className="w-4 h-4" />}
                        {canteen.amenities.includes('Air-conditioned') && <AirVent className="w-4 h-4" />}
                        {canteen.amenities.includes('Wheelchair accessible') && <Car className="w-4 h-4" />}
                        <span>{canteen.amenities.join(', ')}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => onNavigate('canteen-details', { canteen })}
                      className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-80 space-y-6">
            {/* About Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">About NUSmartQueue</h3>
              <p className="text-gray-600 mb-4">
                Get smart canteen recommendations that consider both queue times and real-time bus 
                schedules to help you make the best dining decisions.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Real-time queue information</li>
                <li>• Live bus timing data</li>
                <li>• Optimized travel routes</li>
                <li>• Personalized recommendations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedStudentDashboard;

