
import { RecommendationService, RecommendationCriteria, StallData } from './recommendationService';

jest.mock('./locationService', () => ({
  calculateDistance: jest.fn((lat1, lon1, lat2, lon2) => {
    // Simple distance calculation for testing
    const latDiff = lat2 - lat1;
    const lonDiff = lon2 - lon1;
    return Math.sqrt(latDiff * latDiff + lonDiff * lonDiff) * 111000; // Rough conversion to meters
  }),
  calculateWalkingTime: jest.fn((distance) => Math.ceil(distance / 80)), // 80 meters per minute
  getNearbyCanteens: jest.fn(() => []),
}));

describe('RecommendationService additional tests', () => {
  let service: RecommendationService;

  beforeEach(() => {
    service = RecommendationService.getInstance();
  });

  // Test cases for calculateRecommendationScore
  describe('calculateRecommendationScore', () => {
    const mockStall: StallData = {
      id: 'test-stall',
      name: 'Test Stall',
      canteenId: 'test-canteen',
      canteenName: 'Test Canteen',
      category: 'Test',
      queueLength: 5,
      estimatedWaitTime: 10,
      isOpen: true,
      averageRating: 4.0,
      priceRange: 'medium',
      location: { latitude: 1.0, longitude: 1.0 },
    };

    it('calculates score with user location', () => {
      const criteria: RecommendationCriteria = {
        userLocation: { latitude: 1.001, longitude: 1.001 },
      };
      const result = (service as any).calculateRecommendationScore(mockStall, criteria);
      expect(result.score).toBeDefined();
      expect(result.distance).toBeDefined();
      expect(result.walkingTime).toBeDefined();
      expect(result.factors.distanceScore).toBeDefined();
    });

    it('calculates score without user location', () => {
      const criteria: RecommendationCriteria = {};
      const result = (service as any).calculateRecommendationScore(mockStall, criteria);
      expect(result.score).toBeDefined();
      expect(result.distance).toBeUndefined();
      expect(result.walkingTime).toBeUndefined();
      expect(result.factors.distanceScore).toBe(50); // Default score
    });

    it('calculates price score correctly - perfect match', () => {
      const criteria: RecommendationCriteria = { priceRange: ['medium'] };
      const result = (service as any).calculateRecommendationScore(mockStall, criteria);
      expect(result.factors.priceScore).toBe(100);
    });

    it('calculates price score correctly - adjacent match', () => {
      const criteria: RecommendationCriteria = { priceRange: ['low'] };
      const result = (service as any).calculateRecommendationScore(mockStall, criteria);
      expect(result.factors.priceScore).toBe(70);
    });

    it('calculates price score correctly - no match', () => {
      const criteria: RecommendationCriteria = { priceRange: ['low', 'high'] };
      const result = (service as any).calculateRecommendationScore({ ...mockStall, priceRange: 'medium' }, criteria);
      expect(result.factors.priceScore).toBe(70);
    });

    it('calculates price score correctly - far from preferred', () => {
      const criteria: RecommendationCriteria = { priceRange: ['low'] };
      const result = (service as any).calculateRecommendationScore({ ...mockStall, priceRange: 'high' }, criteria);
      expect(result.factors.priceScore).toBe(30);
    });

    it('calculates price score correctly - no preference', () => {
      const criteria: RecommendationCriteria = {};
      const result = (service as any).calculateRecommendationScore(mockStall, criteria);
      expect(result.factors.priceScore).toBe(50);
    });
  });

  // Test cases for getCrowdLevel
  describe('getCrowdLevel', () => {
    it('returns low for queue length <= 3', () => {
      expect((service as any).getCrowdLevel(3)).toBe('low');
      expect((service as any).getCrowdLevel(1)).toBe('low');
    });

    it('returns medium for queue length <= 8', () => {
      expect((service as any).getCrowdLevel(8)).toBe('medium');
      expect((service as any).getCrowdLevel(5)).toBe('medium');
    });

    it('returns high for queue length > 8', () => {
      expect((service as any).getCrowdLevel(9)).toBe('high');
      expect((service as any).getCrowdLevel(15)).toBe('high');
    });
  });

  // Test cases for generateRecommendation
  describe('generateRecommendation', () => {
    const mockStall: StallData = {
      id: 'test-stall',
      name: 'Test Stall',
      canteenId: 'test-canteen',
      canteenName: 'Test Canteen',
      category: 'Test',
      queueLength: 5,
      estimatedWaitTime: 10,
      isOpen: true,
      averageRating: 4.0,
      priceRange: 'medium',
      location: { latitude: 1.0, longitude: 1.0 },
    };

    it('generates excellent recommendation for high score, low crowd, close', () => {
      const metrics = { distance: 100, walkingTime: 1, crowdLevel: 'low', score: 85 };
      const recommendation = (service as any).generateRecommendation(mockStall, metrics);
      expect(recommendation).toBe('Excellent choice! Short queue and very close to you.');
    });

    it('generates great option for high score, low crowd', () => {
      const metrics = { distance: 500, walkingTime: 10, crowdLevel: 'low', score: 85 };
      const recommendation = (service as any).generateRecommendation(mockStall, metrics);
      expect(recommendation).toBe('Great option with minimal wait time.');
    });

    it('generates highly recommended for high score', () => {
      const metrics = { distance: 500, walkingTime: 10, crowdLevel: 'medium', score: 85 };
      const recommendation = (service as any).generateRecommendation(mockStall, metrics);
      expect(recommendation).toBe('Highly recommended based on your preferences.');
    });

    it('generates good food but crowded for medium score, high crowd', () => {
      const metrics = { distance: 500, walkingTime: 10, crowdLevel: 'high', score: 65 };
      const recommendation = (service as any).generateRecommendation(mockStall, metrics);
      expect(recommendation).toBe('Good food but expect a longer wait during peak hours.');
    });

    it('generates worth the walk for medium score, far distance', () => {
      const metrics = { distance: 600, walkingTime: 15, crowdLevel: 'medium', score: 65 };
      const recommendation = (service as any).generateRecommendation(mockStall, metrics);
      expect(recommendation).toBe('Worth the walk for quality food and reasonable wait.');
    });

    it('generates solid choice for medium score', () => {
      const metrics = { distance: 300, walkingTime: 5, crowdLevel: 'medium', score: 65 };
      const recommendation = (service as any).generateRecommendation(mockStall, metrics);
      expect(recommendation).toBe('Solid choice with balanced wait time and quality.');
    });

    it('generates popular spot but crowded for high crowd', () => {
      const metrics = { distance: 300, walkingTime: 5, crowdLevel: 'high', score: 50 };
      const recommendation = (service as any).generateRecommendation(mockStall, metrics);
      expect(recommendation).toBe('Popular spot but quite crowded right now.');
    });

    it('generates a bit far for far distance', () => {
      const metrics = { distance: 900, walkingTime: 20, crowdLevel: 'low', score: 50 };
      const recommendation = (service as any).generateRecommendation(mockStall, metrics);
      expect(recommendation).toBe('A bit far but might be worth it if you have time.');
    });

    it('generates default recommendation', () => {
      const metrics = { crowdLevel: 'low', score: 40 };
      const recommendation = (service as any).generateRecommendation(mockStall, metrics);
      expect(recommendation).toBe('Consider this option if other preferences don\'t match.');
    });
  });
});


