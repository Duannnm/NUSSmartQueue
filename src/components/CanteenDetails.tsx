import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  Users, 
  Star, 
  Utensils,
  RefreshCw,
  LogOut,
  Filter,
  Wifi,
  AirVent,
  Car,
  DollarSign,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface Vendor {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  averagePrice: number;
  queueLength: number;
  estimatedWait: number;
  crowdLevel: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'Closed' | 'Busy';
  specialties: string[];
  operatingHours: string;
  lastUpdated: string;
}

interface CanteenDetailsProps {
  canteen: any;
  onNavigate: (page: string, data?: any) => void;
}

const CanteenDetails: React.FC<CanteenDetailsProps> = ({ canteen, onNavigate }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [sortBy, setSortBy] = useState<'wait' | 'rating' | 'price' | 'queue'>('wait');
  const [filterCuisine, setFilterCuisine] = useState<string>('all');
  const [showOnlyOpen, setShowOnlyOpen] = useState(false);

  useEffect(() => {
    // Generate realistic vendor data based on the canteen
    const generateVendors = (): Vendor[] => {
      const baseVendors = [
        {
          id: 'chinese-stall',
          name: 'Golden Dragon Chinese Stall',
          cuisine: 'Chinese',
          rating: 4.3,
          averagePrice: 4.5,
          queueLength: 3,
          estimatedWait: 8,
          crowdLevel: 'Low' as const,
          status: 'Open' as const,
          specialties: ['Chicken Rice', 'Char Siu Rice', 'Wonton Noodles'],
          operatingHours: '08:00 - 19:00',
          lastUpdated: '2 min ago'
        },
        {
          id: 'malay-stall',
          name: 'Warung Pak Ali',
          cuisine: 'Malay',
          rating: 4.1,
          averagePrice: 4.2,
          queueLength: 5,
          estimatedWait: 12,
          crowdLevel: 'Medium' as const,
          status: 'Open' as const,
          specialties: ['Nasi Lemak', 'Mee Goreng', 'Rendang'],
          operatingHours: '08:30 - 18:30',
          lastUpdated: '1 min ago'
        },
        {
          id: 'indian-stall',
          name: 'Spice Garden Indian Cuisine',
          cuisine: 'Indian',
          rating: 4.4,
          averagePrice: 4.8,
          queueLength: 2,
          estimatedWait: 6,
          crowdLevel: 'Low' as const,
          status: 'Open' as const,
          specialties: ['Biryani', 'Curry Rice', 'Roti Prata'],
          operatingHours: '08:00 - 20:00',
          lastUpdated: '3 min ago'
        },
        {
          id: 'western-stall',
          name: 'Campus Grill',
          cuisine: 'Western',
          rating: 4.0,
          averagePrice: 6.5,
          queueLength: 8,
          estimatedWait: 18,
          crowdLevel: 'High' as const,
          status: 'Busy' as const,
          specialties: ['Grilled Chicken', 'Fish & Chips', 'Pasta'],
          operatingHours: '10:00 - 21:00',
          lastUpdated: '1 min ago'
        },
        {
          id: 'drinks-stall',
          name: 'Fresh Juice Bar',
          cuisine: 'Beverages',
          rating: 4.2,
          averagePrice: 3.0,
          queueLength: 1,
          estimatedWait: 3,
          crowdLevel: 'Low' as const,
          status: 'Open' as const,
          specialties: ['Fresh Juice', 'Smoothies', 'Coffee'],
          operatingHours: '07:30 - 19:30',
          lastUpdated: '4 min ago'
        },
        {
          id: 'snacks-stall',
          name: 'Quick Bites',
          cuisine: 'Snacks',
          rating: 3.8,
          averagePrice: 2.5,
          queueLength: 0,
          estimatedWait: 2,
          crowdLevel: 'Low' as const,
          status: 'Open' as const,
          specialties: ['Sandwiches', 'Pastries', 'Light Snacks'],
          operatingHours: '08:00 - 18:00',
          lastUpdated: '5 min ago'
        }
      ];

      // Filter based on canteen type
      if (canteen.id === 'com2') {
        return baseVendors;
      } else if (canteen.id === 'arts') {
        return baseVendors.slice(0, 4);
      } else if (canteen.id === 'science') {
        return baseVendors.slice(0, 5);
      } else {
        return baseVendors.slice(0, 6);
      }
    };

    setVendors(generateVendors());
  }, [canteen]);

  const getCrowdColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'High': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'text-green-600 bg-green-100';
      case 'Busy': return 'text-orange-600 bg-orange-100';
      case 'Closed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const sortedAndFilteredVendors = vendors
    .filter(vendor => {
      if (filterCuisine !== 'all' && vendor.cuisine !== filterCuisine) return false;
      if (showOnlyOpen && vendor.status !== 'Open') return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'wait': return a.estimatedWait - b.estimatedWait;
        case 'rating': return b.rating - a.rating;
        case 'price': return a.averagePrice - b.averagePrice;
        case 'queue': return a.queueLength - b.queueLength;
        default: return 0;
      }
    });

  const cuisineTypes = ['all', ...Array.from(new Set(vendors.map(v => v.cuisine)))];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => onNavigate('student-dashboard')}
              className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">NUSmartQueue</h1>
                <p className="text-sm text-gray-600">Smart canteen recommendations</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Online</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600">Location found</span>
            </div>
            <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900">
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
        {/* Canteen Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{canteen.name}</h1>
              <p className="text-lg text-gray-600 mb-4">{canteen.location} • {canteen.level}</p>
              
              {/* Cuisine Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {canteen.cuisines.map((cuisine: string) => (
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
              <div className="text-5xl font-bold text-red-500 mb-1">{canteen.score}</div>
              <div className="text-sm text-gray-600">Overall Score</div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-6 mb-6">
            <div className="flex items-center space-x-3">
              <Clock className="w-6 h-6 text-gray-400" />
              <div>
                <p className="font-semibold text-gray-900">{canteen.totalTime}</p>
                <p className="text-sm text-gray-600">Total time</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-gray-400" />
              <div>
                <p className="font-semibold text-gray-900">{canteen.peopleCount} people</p>
                <p className="text-sm text-gray-600">In queue</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <MapPin className="w-6 h-6 text-gray-400" />
              <div>
                <p className="font-semibold text-gray-900">{canteen.walkingTime}</p>
                <p className="text-sm text-gray-600">Walking time</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <DollarSign className="w-6 h-6 text-gray-400" />
              <div>
                <p className="font-semibold text-gray-900">${canteen.averagePrice}</p>
                <p className="text-sm text-gray-600">Average price</p>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="flex items-center space-x-4 text-sm text-gray-600 pt-4 border-t border-gray-200">
            <span>Operating: {canteen.operating}</span>
            <span>•</span>
            <div className="flex items-center space-x-2">
              {canteen.amenities.includes('WiFi') && <Wifi className="w-4 h-4" />}
              {canteen.amenities.includes('Air-conditioned') && <AirVent className="w-4 h-4" />}
              {canteen.amenities.includes('Wheelchair accessible') && <Car className="w-4 h-4" />}
              <span>{canteen.amenities.join(', ')}</span>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Vendors & Stalls</h3>
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm">
                {sortedAndFilteredVendors.length} stalls
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
              >
                <option value="wait">Wait Time</option>
                <option value="rating">Rating</option>
                <option value="price">Price</option>
                <option value="queue">Queue Length</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Cuisine:</label>
              <select 
                value={filterCuisine}
                onChange={(e) => setFilterCuisine(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
              >
                {cuisineTypes.map(cuisine => (
                  <option key={cuisine} value={cuisine}>
                    {cuisine === 'all' ? 'All Cuisines' : cuisine}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input 
                type="checkbox"
                id="openOnly"
                checked={showOnlyOpen}
                onChange={(e) => setShowOnlyOpen(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="openOnly" className="text-sm font-medium text-gray-700">
                Open only
              </label>
            </div>
          </div>
        </div>

        {/* Vendors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedAndFilteredVendors.map((vendor) => (
            <div key={vendor.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-gray-900 mb-1">{vendor.name}</h4>
                  <p className="text-gray-600 mb-2">{vendor.cuisine}</p>
                  
                  {/* Rating and Price */}
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{vendor.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">${vendor.averagePrice}</span>
                    </div>
                  </div>
                </div>
                
                {/* Status */}
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(vendor.status)}`}>
                    {vendor.status}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCrowdColor(vendor.crowdLevel)}`}>
                    {vendor.crowdLevel}
                  </span>
                </div>
              </div>

              {/* Queue Info */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{vendor.queueLength} people</p>
                    <p className="text-xs text-gray-600">in queue</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{vendor.estimatedWait} min</p>
                    <p className="text-xs text-gray-600">estimated wait</p>
                  </div>
                </div>
              </div>

              {/* Specialties */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Popular items:</p>
                <div className="flex flex-wrap gap-1">
                  {vendor.specialties.map((item) => (
                    <span 
                      key={item}
                      className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-600">
                  <p>Hours: {vendor.operatingHours}</p>
                  <p>Updated: {vendor.lastUpdated}</p>
                </div>
                
                <div className="flex items-center space-x-1 text-xs text-gray-600">
                  <TrendingUp className="w-3 h-3" />
                  <span>Live data</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {sortedAndFilteredVendors.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h3>
            <p className="text-gray-600">Try adjusting your filters to see more options.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CanteenDetails;

