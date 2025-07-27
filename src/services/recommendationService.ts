// Enhanced recommendation service for canteen suggestions

import { CanteenLocation, calculateDistance, calculateWalkingTime, getNearbyCanteens } from './locationService';

export interface StallData {
  id: string;
  name: string;
  canteenId: string;
  canteenName: string;
  category: string;
  queueLength: number;
  estimatedWaitTime: number;
  isOpen: boolean;
  averageRating: number;
  priceRange: 'low' | 'medium' | 'high';
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface RecommendationCriteria {
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  maxDistance?: number; // in meters
  maxWaitTime?: number; // in minutes
  preferredCategories?: string[];
  priceRange?: 'low' | 'medium' | 'high'[];
  sortBy?: 'distance' | 'waitTime' | 'rating' | 'smart';
  includeClosedStalls?: boolean;
}

export interface RecommendationResult {
  stall: StallData;
  score: number;
  distance?: number;
  walkingTime?: number;
  crowdLevel: 'low' | 'medium' | 'high';
  recommendation: string;
  factors: {
    distanceScore: number;
    waitTimeScore: number;
    ratingScore: number;
    crowdScore: number;
    priceScore: number;
  };
}

// Mock stall data for demonstration
const MOCK_STALLS: StallData[] = [
  {
    id: 'western-deck',
    name: 'Western Cuisine',
    canteenId: 'deck',
    canteenName: 'The Deck',
    category: 'Western',
    queueLength: 5,
    estimatedWaitTime: 12,
    isOpen: true,
    averageRating: 4.2,
    priceRange: 'medium',
    location: { latitude: 1.2966, longitude: 103.7764 },
  },
  {
    id: 'asian-deck',
    name: 'Asian Delights',
    canteenId: 'deck',
    canteenName: 'The Deck',
    category: 'Asian',
    queueLength: 8,
    estimatedWaitTime: 18,
    isOpen: true,
    averageRating: 4.5,
    priceRange: 'low',
    location: { latitude: 1.2966, longitude: 103.7765 },
  },
  {
    id: 'healthy-techno',
    name: 'Healthy Bowl',
    canteenId: 'techno-edge',
    canteenName: 'Techno Edge',
    category: 'Healthy',
    queueLength: 3,
    estimatedWaitTime: 8,
    isOpen: true,
    averageRating: 4.0,
    priceRange: 'high',
    location: { latitude: 1.2980, longitude: 103.7710 },
  },
  {
    id: 'local-arts',
    name: 'Local Favorites',
    canteenId: 'arts-canteen',
    canteenName: 'Arts Canteen',
    category: 'Local',
    queueLength: 12,
    estimatedWaitTime: 25,
    isOpen: true,
    averageRating: 4.3,
    priceRange: 'low',
    location: { latitude: 1.2958, longitude: 103.7702 },
  },
  {
    id: 'japanese-fine',
    name: 'Japanese Corner',
    canteenId: 'fine-food',
    canteenName: 'Fine Food',
    category: 'Japanese',
    queueLength: 6,
    estimatedWaitTime: 15,
    isOpen: true,
    averageRating: 4.4,
    priceRange: 'high',
    location: { latitude: 1.2966, longitude: 103.7734 },
  },
  {
    id: 'indian-science',
    name: 'Spice Garden',
    canteenId: 'science-canteen',
    canteenName: 'Science Canteen',
    category: 'Indian',
    queueLength: 4,
    estimatedWaitTime: 10,
    isOpen: true,
    averageRating: 4.1,
    priceRange: 'medium',
    location: { latitude: 1.2966, longitude: 103.7800 },
  },
];

export class RecommendationService {
  private static instance: RecommendationService;

  static getInstance(): RecommendationService {
    if (!RecommendationService.instance) {
      RecommendationService.instance = new RecommendationService();
    }
    return RecommendationService.instance;
  }

  /**
   * Get personalized recommendations based on user criteria
   */
  getRecommendations(criteria: RecommendationCriteria = {}): RecommendationResult[] {
    let stalls = [...MOCK_STALLS];

    // Filter by open status
    if (!criteria.includeClosedStalls) {
      stalls = stalls.filter(stall => stall.isOpen);
    }

    // Filter by categories
    if (criteria.preferredCategories && criteria.preferredCategories.length > 0) {
      stalls = stalls.filter(stall => 
        criteria.preferredCategories!.includes(stall.category)
      );
    }

    // Filter by price range
    if (criteria.priceRange && criteria.priceRange.length > 0) {
      stalls = stalls.filter(stall => 
        criteria.priceRange!.includes(stall.priceRange as any)
      );
    }

    // Calculate recommendations with scores
    const recommendations = stalls.map(stall => {
      const result = this.calculateRecommendationScore(stall, criteria);
      return result;
    });

    // Filter by distance if specified
    if (criteria.maxDistance && criteria.userLocation) {
      const filtered = recommendations.filter(rec => 
        rec.distance !== undefined && rec.distance <= criteria.maxDistance!
      );
      if (filtered.length > 0) {
        return this.sortRecommendations(filtered, criteria.sortBy || 'smart');
      }
    }

    // Filter by wait time if specified
    if (criteria.maxWaitTime) {
      const filtered = recommendations.filter(rec => 
        rec.stall.estimatedWaitTime <= criteria.maxWaitTime!
      );
      if (filtered.length > 0) {
        return this.sortRecommendations(filtered, criteria.sortBy || 'smart');
      }
    }

    return this.sortRecommendations(recommendations, criteria.sortBy || 'smart');
  }

  /**
   * Calculate recommendation score for a stall
   */
  private calculateRecommendationScore(
    stall: StallData, 
    criteria: RecommendationCriteria
  ): RecommendationResult {
    let distance: number | undefined;
    let walkingTime: number | undefined;
    let distanceScore = 50; // Default neutral score

    // Calculate distance if user location is provided
    if (criteria.userLocation) {
      distance = calculateDistance(
        criteria.userLocation.latitude,
        criteria.userLocation.longitude,
        stall.location.latitude,
        stall.location.longitude
      );
      walkingTime = calculateWalkingTime(distance);
      
      // Distance score: closer is better (0-100)
      distanceScore = Math.max(0, 100 - (distance / 20)); // 20m = 1 point deduction
    }

    // Wait time score: shorter wait is better (0-100)
    const waitTimeScore = Math.max(0, 100 - (stall.estimatedWaitTime * 3));

    // Rating score: higher rating is better (0-100)
    const ratingScore = (stall.averageRating / 5) * 100;

    // Crowd score: lower queue is better (0-100)
    const crowdScore = Math.max(0, 100 - (stall.queueLength * 8));

    // Price score: based on preference (simplified)
    const priceScore = this.calculatePriceScore(stall.priceRange, criteria.priceRange);

    // Calculate overall score with weights
    const weights = {
      distance: 0.25,
      waitTime: 0.30,
      rating: 0.20,
      crowd: 0.15,
      price: 0.10,
    };

    const score = 
      distanceScore * weights.distance +
      waitTimeScore * weights.waitTime +
      ratingScore * weights.rating +
      crowdScore * weights.crowd +
      priceScore * weights.price;

    // Determine crowd level
    const crowdLevel = this.getCrowdLevel(stall.queueLength);

    // Generate recommendation text
    const recommendation = this.generateRecommendation(stall, {
      distance,
      walkingTime,
      crowdLevel,
      score,
    });

    return {
      stall,
      score: Math.round(score),
      distance,
      walkingTime,
      crowdLevel,
      recommendation,
      factors: {
        distanceScore: Math.round(distanceScore),
        waitTimeScore: Math.round(waitTimeScore),
        ratingScore: Math.round(ratingScore),
        crowdScore: Math.round(crowdScore),
        priceScore: Math.round(priceScore),
      },
    };
  }

  /**
   * Calculate price score based on user preference
   */
  private calculatePriceScore(
    stallPrice: 'low' | 'medium' | 'high',
    preferredPrices?: 'low' | 'medium' | 'high'[]
  ): number {
    if (!preferredPrices || preferredPrices.length === 0) {
      return 50; // Neutral score if no preference
    }

    if (preferredPrices.includes(stallPrice as any)) {
      return 100; // Perfect match
    }

    // Partial scores for adjacent price ranges
    const priceOrder = ['low', 'medium', 'high'];
    const stallIndex = priceOrder.indexOf(stallPrice);
    
    for (const preferred of preferredPrices) {
      const preferredIndex = priceOrder.indexOf(preferred);
      const distance = Math.abs(stallIndex - preferredIndex);
      
      if (distance === 1) {
        return 70; // Adjacent price range
      }
    }

    return 30; // Far from preferred price range
  }

  /**
   * Determine crowd level based on queue length
   */
  private getCrowdLevel(queueLength: number): 'low' | 'medium' | 'high' {
    if (queueLength <= 3) return 'low';
    if (queueLength <= 8) return 'medium';
    return 'high';
  }

  /**
   * Generate recommendation text
   */
  private generateRecommendation(
    stall: StallData,
    metrics: {
      distance?: number;
      walkingTime?: number;
      crowdLevel: 'low' | 'medium' | 'high';
      score: number;
    }
  ): string {
    const { distance, walkingTime, crowdLevel, score } = metrics;

    if (score >= 80) {
      if (crowdLevel === 'low' && walkingTime && walkingTime <= 5) {
        return `Excellent choice! Short queue and very close to you.`;
      }
      if (crowdLevel === 'low') {
        return `Great option with minimal wait time.`;
      }
      return `Highly recommended based on your preferences.`;
    }

    if (score >= 60) {
      if (crowdLevel === 'high') {
        return `Good food but expect a longer wait during peak hours.`;
      }
      if (distance && distance > 500) {
        return `Worth the walk for quality food and reasonable wait.`;
      }
      return `Solid choice with balanced wait time and quality.`;
    }

    if (crowdLevel === 'high') {
      return `Popular spot but quite crowded right now.`;
    }

    if (distance && distance > 800) {
      return `A bit far but might be worth it if you have time.`;
    }

    return `Consider this option if other preferences don't match.`;
  }

  /**
   * Sort recommendations based on criteria
   */
  private sortRecommendations(
    recommendations: RecommendationResult[],
    sortBy: 'distance' | 'waitTime' | 'rating' | 'smart'
  ): RecommendationResult[] {
    switch (sortBy) {
      case 'distance':
        return recommendations.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      
      case 'waitTime':
        return recommendations.sort((a, b) => 
          a.stall.estimatedWaitTime - b.stall.estimatedWaitTime
        );
      
      case 'rating':
        return recommendations.sort((a, b) => 
          b.stall.averageRating - a.stall.averageRating
        );
      
      case 'smart':
      default:
        return recommendations.sort((a, b) => b.score - a.score);
    }
  }

  /**
   * Get quick recommendations for immediate decision making
   */
  getQuickRecommendations(userLocation?: { latitude: number; longitude: number }): {
    closest: RecommendationResult | null;
    fastest: RecommendationResult | null;
    leastCrowded: RecommendationResult | null;
    bestRated: RecommendationResult | null;
  } {
    const criteria: RecommendationCriteria = {
      userLocation,
      includeClosedStalls: false,
    };

    const recommendations = this.getRecommendations(criteria);

    if (recommendations.length === 0) {
      return {
        closest: null,
        fastest: null,
        leastCrowded: null,
        bestRated: null,
      };
    }

    const closest = userLocation 
      ? recommendations.reduce((prev, curr) => 
          (prev.distance || Infinity) < (curr.distance || Infinity) ? prev : curr
        )
      : null;

    const fastest = recommendations.reduce((prev, curr) => 
      prev.stall.estimatedWaitTime < curr.stall.estimatedWaitTime ? prev : curr
    );

    const leastCrowded = recommendations.reduce((prev, curr) => 
      prev.stall.queueLength < curr.stall.queueLength ? prev : curr
    );

    const bestRated = recommendations.reduce((prev, curr) => 
      prev.stall.averageRating > curr.stall.averageRating ? prev : curr
    );

    return {
      closest,
      fastest,
      leastCrowded,
      bestRated,
    };
  }

  /**
   * Get all available stalls for display
   */
  getAllStalls(): StallData[] {
    return [...MOCK_STALLS];
  }

  /**
   * Get stall by ID
   */
  getStallById(id: string): StallData | undefined {
    return MOCK_STALLS.find(stall => stall.id === id);
  }
}

