import React, { useState, useEffect } from 'react';
import { 
  RecommendationService, 
  RecommendationCriteria, 
  RecommendationResult 
} from '../services/recommendationService';
import { 
  MapPin, 
  Clock, 
  Star, 
  Users, 
  Filter, 
  Zap, 
  Target,
  TrendingUp,
  Award,
  Navigation
} from 'lucide-react';

interface RecommendationEngineProps {
  userLocation?: { latitude: number; longitude: number };
  onStallSelect?: (stallId: string) => void;
}

const RecommendationEngine: React.FC<RecommendationEngineProps> = ({ 
  userLocation, 
  onStallSelect 
}) => {
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [quickRecs, setQuickRecs] = useState<any>(null);
  const [criteria, setCriteria] = useState<RecommendationCriteria>({
    userLocation,
    maxDistance: 1000,
    maxWaitTime: 20,
    sortBy: 'smart',
    includeClosedStalls: false,
  });
  const [showFilters, setShowFilters] = useState(false);

  const recommendationService = RecommendationService.getInstance();

  useEffect(() => {
    const updatedCriteria = { ...criteria, userLocation };
    const recs = recommendationService.getRecommendations(updatedCriteria);
    const quick = recommendationService.getQuickRecommendations(userLocation);
    
    setRecommendations(recs);
    setQuickRecs(quick);
  }, [userLocation, criteria]);

  const updateCriteria = (updates: Partial<RecommendationCriteria>) => {
    setCriteria(prev => ({ ...prev, ...updates }));
  };

  const formatDistance = (distance?: number): string => {
    if (!distance) return 'Unknown';
    if (distance < 1000) return `${Math.round(distance)}m`;
    return `${(distance / 1000).toFixed(1)}km`;
  };

  const getCrowdColor = (level: 'low' | 'medium' | 'high'): string => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Quick Recommendations */}
      {quickRecs && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Zap className="h-5 w-5 mr-2 text-yellow-500" />
            Quick Picks
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickRecs.closest && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Navigation className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-sm font-medium text-blue-700">Closest</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{quickRecs.closest.stall.name}</p>
                <p className="text-xs text-gray-600">{formatDistance(quickRecs.closest.distance)}</p>
              </div>
            )}
            
            {quickRecs.fastest && (
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Clock className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm font-medium text-green-700">Fastest</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{quickRecs.fastest.stall.name}</p>
                <p className="text-xs text-gray-600">{quickRecs.fastest.stall.estimatedWaitTime} min wait</p>
              </div>
            )}
            
            {quickRecs.leastCrowded && (
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Users className="h-4 w-4 text-purple-500 mr-1" />
                  <span className="text-sm font-medium text-purple-700">Least Crowded</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{quickRecs.leastCrowded.stall.name}</p>
                <p className="text-xs text-gray-600">{quickRecs.leastCrowded.stall.queueLength} people</p>
              </div>
            )}
            
            {quickRecs.bestRated && (
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-sm font-medium text-yellow-700">Best Rated</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{quickRecs.bestRated.stall.name}</p>
                <p className="text-xs text-gray-600">{quickRecs.bestRated.stall.averageRating} ⭐</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Target className="h-5 w-5 mr-2 text-blue-500" />
            Smart Recommendations
          </h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Distance
              </label>
              <select
                value={criteria.maxDistance}
                onChange={(e) => updateCriteria({ maxDistance: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value={500}>500m</option>
                <option value={1000}>1km</option>
                <option value={2000}>2km</option>
                <option value={5000}>5km</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Wait Time
              </label>
              <select
                value={criteria.maxWaitTime}
                onChange={(e) => updateCriteria({ maxWaitTime: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={20}>20 minutes</option>
                <option value={30}>30 minutes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={criteria.sortBy}
                onChange={(e) => updateCriteria({ sortBy: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="smart">Smart Score</option>
                <option value="distance">Distance</option>
                <option value="waitTime">Wait Time</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">No recommendations found matching your criteria.</p>
            <button
              onClick={() => setCriteria({ userLocation, sortBy: 'smart' })}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
            >
              Reset filters
            </button>
          </div>
        ) : (
          recommendations.map((rec, index) => (
            <div
              key={rec.stall.id}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onStallSelect?.(rec.stall.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{rec.stall.name}</h3>
                    {index === 0 && (
                      <Award className="h-5 w-5 text-yellow-500" title="Top Recommendation" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{rec.stall.canteenName}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Star className="h-4 w-4 mr-1 text-yellow-400" />
                      {rec.stall.averageRating}
                    </span>
                    <span className="capitalize">{rec.stall.category}</span>
                    <span className="capitalize">{rec.stall.priceRange} price</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getScoreColor(rec.score)}`}>
                    {rec.score}
                  </div>
                  <div className="text-xs text-gray-500">Smart Score</div>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {rec.distance && (
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm font-medium">{formatDistance(rec.distance)}</span>
                    </div>
                    {rec.walkingTime && (
                      <div className="text-xs text-gray-500">{rec.walkingTime} min walk</div>
                    )}
                  </div>
                )}
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Clock className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm font-medium">{rec.stall.estimatedWaitTime} min</span>
                  </div>
                  <div className="text-xs text-gray-500">wait time</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Users className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm font-medium">{rec.stall.queueLength}</span>
                  </div>
                  <div className="text-xs text-gray-500">in queue</div>
                </div>
                
                <div className="text-center">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCrowdColor(rec.crowdLevel)}`}>
                    {rec.crowdLevel} crowd
                  </span>
                </div>
              </div>

              {/* Recommendation Text */}
              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">{rec.recommendation}</p>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-5 gap-2 text-xs">
                <div className="text-center">
                  <div className="text-gray-600">Distance</div>
                  <div className="font-medium">{rec.factors.distanceScore}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-600">Wait</div>
                  <div className="font-medium">{rec.factors.waitTimeScore}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-600">Rating</div>
                  <div className="font-medium">{rec.factors.ratingScore}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-600">Crowd</div>
                  <div className="font-medium">{rec.factors.crowdScore}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-600">Price</div>
                  <div className="font-medium">{rec.factors.priceScore}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecommendationEngine;

