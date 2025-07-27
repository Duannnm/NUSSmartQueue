import React, { useState, useEffect } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import { LocationService, CanteenLocation, getNearbyCanteens } from '../services/locationService';
import { MapPin, Navigation, Clock, AlertCircle } from 'lucide-react';

interface LocationDisplayProps {
  onLocationUpdate?: (location: { latitude: number; longitude: number }) => void;
  showNearbyCanteens?: boolean;
}

const LocationDisplay: React.FC<LocationDisplayProps> = ({ 
  onLocationUpdate, 
  showNearbyCanteens = true 
}) => {
  const { latitude, longitude, accuracy, error, loading } = useGeolocation({
    enableHighAccuracy: true,
    watch: true,
  });
  
  const [nearbyCanteens, setNearbyCanteens] = useState<Array<CanteenLocation & { distance: number; walkingTime: number }>>([]);
  const [indoorLocation, setIndoorLocation] = useState<string | null>(null);

  useEffect(() => {
    if (latitude && longitude) {
      onLocationUpdate?.({ latitude, longitude });
      
      // Get nearby canteens
      const nearby = getNearbyCanteens(latitude, longitude);
      setNearbyCanteens(nearby);
      
      // Check for indoor positioning
      if (nearby.length > 0 && nearby[0].distance < 100) {
        setIndoorLocation(`${nearby[0].building} - ${nearby[0].name}`);
      } else {
        setIndoorLocation(null);
      }
    }
  }, [latitude, longitude, onLocationUpdate]);

  const formatDistance = (distance: number): string => {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Getting your location...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <div>
            <h3 className="text-red-800 font-medium">Location Error</h3>
            <p className="text-red-600 text-sm">{error}</p>
            <p className="text-red-600 text-xs mt-1">
              Please enable location services to get personalized recommendations.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!latitude || !longitude) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-yellow-500" />
          <span className="text-yellow-800">Location not available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Location */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 mb-1">Your Location</h3>
            {indoorLocation ? (
              <div>
                <p className="text-sm text-blue-600 font-medium">{indoorLocation}</p>
                <p className="text-xs text-gray-500">Indoor positioning active</p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600">
                  {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </p>
                <p className="text-xs text-gray-500">
                  Accuracy: ±{accuracy ? Math.round(accuracy) : 'Unknown'}m
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nearby Canteens */}
      {showNearbyCanteens && nearbyCanteens.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <Navigation className="h-4 w-4 mr-2" />
            Nearby Canteens
          </h3>
          <div className="space-y-3">
            {nearbyCanteens.slice(0, 3).map((canteen) => (
              <div key={canteen.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{canteen.name}</p>
                  <p className="text-xs text-gray-500">{canteen.building}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{formatDistance(canteen.distance)}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {canteen.walkingTime} min walk
                  </div>
                </div>
              </div>
            ))}
          </div>
          {nearbyCanteens.length > 3 && (
            <p className="text-xs text-gray-500 mt-2">
              +{nearbyCanteens.length - 3} more canteens nearby
            </p>
          )}
        </div>
      )}

      {/* Location Services Info */}
      <div className="bg-blue-50 rounded-lg p-3">
        <p className="text-xs text-blue-700">
          <strong>Enhanced Location Services:</strong> We use GPS combined with indoor positioning 
          to provide accurate location within NUS buildings. Your location data is processed locally 
          and not stored on our servers.
        </p>
      </div>
    </div>
  );
};

export default LocationDisplay;

