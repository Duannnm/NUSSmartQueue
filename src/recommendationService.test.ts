
import { RecommendationService, RecommendationCriteria, StallData } from './recommendationService';

jest.mock('./locationService', () => ({
  calculateDistance: jest.fn((lat1, lon1, lat2, lon2) => {
    const latDiff = lat2 - lat1;
    const lonDiff = lon2 - lon1;
    return Math.sqrt(latDiff * latDiff + lonDiff * lonDiff) * 111000;
  }),
  calculateWalkingTime: jest.fn((distance) => Math.ceil(distance / 80)),
  getNearbyCanteens: jest.fn(() => []),
}));

describe('RecommendationService', () => {
  let service: RecommendationService;

  const mockStalls: StallData[] = [
    {
      id: 's1',
      name: 'Stall 1',
      canteenId: 'c1',
      canteenName: 'Canteen 1',
      category: 'Western',
      queueLength: 5,
      estimatedWaitTime: 10,
      isOpen: true,
      averageRating: 4.0,
      priceRange: 'medium',
      location: { latitude: 1.0, longitude: 1.0 },
    },
    {
      id: 's2',
      name: 'Stall 2',
      canteenId: 'c1',
      canteenName: 'Canteen 1',
      category: 'Asian',
      queueLength: 2,
      estimatedWaitTime: 5,
      isOpen: true,
      averageRating: 4.5,
      priceRange: 'low',
      location: { latitude: 1.001, longitude: 1.001 },
    },
    {
      id: 's3',
      name: 'Stall 3',
      canteenId: 'c2',
      canteenName: 'Canteen 2',
      category: 'Western',
      queueLength: 10,
      estimatedWaitTime: 20,
      isOpen: false,
      averageRating: 3.5,
      priceRange: 'high',
      location: { latitude: 1.002, longitude: 1.002 },
    },
  ];

  beforeEach(() => {
    (RecommendationService as any).instance = null;
    service = RecommendationService.getInstance();
    jest.spyOn(service, 'getAllStalls').mockReturnValue(mockStalls);
    jest.spyOn(service, 'getStallById').mockImplementation((id: string) => mockStalls.find(stall => stall.id === id));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns a singleton instance', () => {
    const instance1 = RecommendationService.getInstance();
    const instance2 = RecommendationService.getInstance();
    expect(instance1).toBe(instance2);
  });

  describe('getAllStalls', () => {
    it('returns all mock stalls', () => {
      const stalls = service.getAllStalls();
      expect(stalls.length).toBe(mockStalls.length);
      expect(stalls).toEqual(mockStalls);
    });
  });

  describe('getStallById', () => {
    it('returns a stall by its ID', () => {
      const stall = service.getStallById('s1');
      expect(stall).toEqual(mockStalls[0]);
    });

    it('returns undefined if stall not found', () => {
      const stall = service.getStallById('non-existent-stall');
      expect(stall).toBeUndefined();
    });
  });

  describe('getRecommendations', () => {
    it('returns all open stalls by default', () => {
      const recommendations = service.getRecommendations();
      expect(recommendations.length).toBe(2); // s1, s2 are open
      expect(recommendations.some(r => r.stall.id === 's3')).toBeFalsy();
    });

    it('includes closed stalls if includeClosedStalls is true', () => {
      const recommendations = service.getRecommendations({ includeClosedStalls: true });
      expect(recommendations.length).toBe(3);
      expect(recommendations.some(r => r.stall.id === 's3')).toBeTruthy();
    });

    it('filters by preferred categories', () => {
      const recommendations = service.getRecommendations({ preferredCategories: ['Western'] });
      expect(recommendations.length).toBe(1);
      expect(recommendations[0].stall.id).toBe('s1');
    });

    it('filters by price range', () => {
      const recommendations = service.getRecommendations({ priceRange: ['low'] });
      expect(recommendations.length).toBe(1);
      expect(recommendations[0].stall.id).toBe('s2');
    });

    it('filters by max distance', () => {
      const recommendations = service.getRecommendations({
        userLocation: { latitude: 1.0, longitude: 1.0 },
        maxDistance: 100,
      });
      expect(recommendations.length).toBe(1); // Only s1 is close enough
      expect(recommendations[0].stall.id).toBe('s1');
    });

    it('filters by max wait time', () => {
      const recommendations = service.getRecommendations({ maxWaitTime: 7 });
      expect(recommendations.length).toBe(1); // Only s2 has wait time <= 7
      expect(recommendations[0].stall.id).toBe('s2');
    });

    it('sorts by distance', () => {
      const recommendations = service.getRecommendations({
        userLocation: { latitude: 1.0, longitude: 1.0 },
        sortBy: 'distance',
        includeClosedStalls: true,
      });
      expect(recommendations[0].stall.id).toBe('s1');
      expect(recommendations[1].stall.id).toBe('s2');
    });

    it('sorts by waitTime', () => {
      const recommendations = service.getRecommendations({ sortBy: 'waitTime', includeClosedStalls: true });
      expect(recommendations[0].stall.id).toBe('s2');
      expect(recommendations[1].stall.id).toBe('s1');
    });

    it('sorts by rating', () => {
      const recommendations = service.getRecommendations({ sortBy: 'rating', includeClosedStalls: true });
      expect(recommendations[0].stall.id).toBe('s2');
      expect(recommendations[1].stall.id).toBe('s1');
    });

    it('sorts by smart (score)', () => {
      const recommendations = service.getRecommendations({ sortBy: 'smart', includeClosedStalls: true });
      expect(recommendations[0].stall.id).toBe('s2');
    });
  });

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
      expect(typeof result.score).toBe('number');
      expect(result.distance).toBeDefined();
      expect(result.walkingTime).toBeDefined();
      expect(result.factors).toBeDefined();
    });

    it('calculates score without user location', () => {
      const criteria: RecommendationCriteria = {};
      const result = (service as any).calculateRecommendationScore(mockStall, criteria);
      expect(result.score).toBeDefined();
      expect(typeof result.score).toBe('number');
      expect(result.distance).toBeUndefined();
      expect(result.walkingTime).toBeUndefined();
      expect(result.factors.distanceScore).toBe(50);
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

    it('generates recommendation text', () => {
      const metrics = { distance: 100, walkingTime: 1, crowdLevel: 'low', score: 85 };
      const recommendation = (service as any).generateRecommendation(mockStall, metrics);
      expect(typeof recommendation).toBe('string');
      expect(recommendation.length).toBeGreaterThan(0);
    });

    it('generates different recommendations based on metrics', () => {
      const metrics1 = { distance: 100, walkingTime: 1, crowdLevel: 'low', score: 85 };
      const metrics2 = { distance: 900, walkingTime: 20, crowdLevel: 'high', score: 40 };
      
      const rec1 = (service as any).generateRecommendation(mockStall, metrics1);
      const rec2 = (service as any).generateRecommendation(mockStall, metrics2);
      
      expect(rec1).not.toBe(rec2);
    });
  });

  describe('getQuickRecommendations', () => {
    it('returns quick recommendations', () => {
      const quickRecs = service.getQuickRecommendations();
      expect(quickRecs).toHaveProperty('closest');
      expect(quickRecs).toHaveProperty('fastest');
      expect(quickRecs).toHaveProperty('leastCrowded');
      expect(quickRecs).toHaveProperty('bestRated');
    });

    it('returns closest stall when user location is provided', () => {
      const quickRecs = service.getQuickRecommendations({ latitude: 1.0, longitude: 1.0 });
      expect(quickRecs.closest).toBeDefined();
      if (quickRecs.closest) {
        expect(quickRecs.closest).toHaveProperty('stall');
        expect(quickRecs.closest).toHaveProperty('distance');
      }
    });

    it('returns null for all quick recommendations if no stalls are available', () => {
      jest.spyOn(service, 'getAllStalls').mockReturnValue([]);
      const quickRecs = service.getQuickRecommendations();
      expect(quickRecs.closest).toBeNull();
      expect(quickRecs.fastest).toBeNull();
      expect(quickRecs.leastCrowded).toBeNull();
      expect(quickRecs.bestRated).toBeNull();
    });
  });
});


