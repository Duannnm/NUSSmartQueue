// RecommendationService.js

import LocationService from './LocationService';

class RecommendationService {
  constructor() {
    this.locationService = new LocationService();
  }

  /**
   * Get canteen recommendations based on user location and current queue data
   * @param {Object} userLocation - User's current location {latitude, longitude}
   * @param {Object} preferences - User preferences (optional)
   * @returns {Promise<Array>} - Sorted array of recommended canteens
   */
  async getRecommendations(userLocation, preferences = {}) {
    try {
      // Mock data for canteens and queue information
      // In a real implementation, this would come from Firebase
      const canteens = this.getMockCanteens();
      const queueData = this.getMockQueueData();
      
      // Calculate scores for each canteen
      const scoredCanteens = await Promise.all(
        canteens.map(async (canteen) => {
          // Get queue information for this canteen
          const canteenQueues = queueData.filter(q => q.canteenLocation === canteen.name);
          
          // Calculate average queue length and wait time
          const avgQueueLength = this.calculateAverageQueueLength(canteenQueues);
          const estimatedWaitTime = this.estimateWaitTime(avgQueueLength);
          
          // Calculate travel times (walking and bus)
          const walkingTime = this.locationService.estimateWalkingTime(
            userLocation, 
            canteen.coordinates
          );
          
          const busTravelTime = await this.calculateBusTravelTime(
            userLocation, 
            canteen.coordinates
          );
          
          // Use the faster travel method
          const travelTime = Math.min(walkingTime, busTravelTime || Infinity);
          const travelMethod = walkingTime <= (busTravelTime || Infinity) ? 'walking' : 'bus';
          
          // Calculate total time (travel + waiting)
          const totalTime = travelTime + estimatedWaitTime;
          
          // Apply preference adjustments if any
          const adjustedScore = this.applyPreferenceAdjustments(
            totalTime, 
            canteen, 
            preferences
          );
          
          return {
            canteen,
            score: adjustedScore,
            metrics: {
              avgQueueLength,
              estimatedWaitTime,
              walkingTime,
              busTravelTime,
              travelTime,
              travelMethod,
              totalTime
            }
          };
        })
      );
      
      // Sort canteens by score (lower is better)
      const sortedRecommendations = scoredCanteens.sort((a, b) => a.score - b.score);
      
      return sortedRecommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw error;
    }
  }
  
  /**
   * Calculate average queue length across all stalls in a canteen
   * @param {Array} canteenQueues - Queue data for stalls in the canteen
   * @returns {number} - Average queue length
   */
  calculateAverageQueueLength(canteenQueues) {
    if (!canteenQueues.length) return 0;
    
    // Only consider open stalls
    const openStalls = canteenQueues.filter(q => q.isOpen);
    if (!openStalls.length) return 0;
    
    const totalQueueLength = openStalls.reduce((sum, q) => sum + q.queueLength, 0);
    return totalQueueLength / openStalls.length;
  }
  
  /**
   * Estimate wait time based on queue length
   * @param {number} queueLength - Average queue length
   * @returns {number} - Estimated wait time in minutes
   */
  estimateWaitTime(queueLength) {
    // Assume each person takes about 2 minutes to be served
    const baseWaitTime = queueLength * 2;
    
    // Add a small buffer for very short queues
    return Math.max(baseWaitTime, 1);
  }
  
  /**
   * Calculate bus travel time between two locations
   * @param {Object} startLocation - Starting coordinates
   * @param {Object} endLocation - Destination coordinates
   * @returns {Promise<number|null>} - Estimated bus travel time in minutes, or null if not possible
   */
  async calculateBusTravelTime(startLocation, endLocation) {
    try {
      // In a real implementation, this would use the NUSNextBus API
      // For now, we'll use a simplified mock implementation
      
      // Find nearest bus stops to start and end locations
      const nearestStartStops = this.findNearestBusStops(startLocation, 2);
      const nearestEndStops = this.findNearestBusStops(endLocation, 2);
      
      if (!nearestStartStops.length || !nearestEndStops.length) {
        return null; // No bus route possible
      }
      
      // Get walking times to/from bus stops
      const walkToStartStop = this.locationService.estimateWalkingTime(
        startLocation, 
        nearestStartStops[0].coordinates
      );
      
      const walkFromEndStop = this.locationService.estimateWalkingTime(
        nearestEndStops[0].coordinates,
        endLocation
      );
      
      // Get bus routes and arrival times
      const busRoutes = this.getMockBusRoutes();
      const startStopArrivals = this.getMockBusArrivals(nearestStartStops[0].id);
      
      // Find routes that connect start and end stops
      const connectingRoutes = busRoutes.filter(route => 
        route.stops.includes(nearestStartStops[0].id) && 
        route.stops.includes(nearestEndStops[0].id)
      );
      
      if (!connectingRoutes.length) {
        return null; // No connecting routes
      }
      
      // Calculate estimated bus travel time for the first connecting route
      const route = connectingRoutes[0];
      const startStopIndex = route.stops.indexOf(nearestStartStops[0].id);
      const endStopIndex = route.stops.indexOf(nearestEndStops[0].id);
      
      // Estimate 2 minutes per stop on average
      const stopsCount = Math.abs(endStopIndex - startStopIndex);
      const onBusTime = stopsCount * 2;
      
      // Get wait time for next bus
      const nextBusWait = startStopArrivals.length > 0 ? 
        startStopArrivals[0].estimatedArrival : 
        route.frequency / 2; // Average wait if no arrival data
      
      // Total bus travel time = walk to stop + wait for bus + time on bus + walk from stop
      const totalBusTime = walkToStartStop + nextBusWait + onBusTime + walkFromEndStop;
      
      return totalBusTime;
    } catch (error) {
      console.error('Error calculating bus travel time:', error);
      return null;
    }
  }
  
  /**
   * Apply user preference adjustments to the score
   * @param {number} baseScore - Base score (total time)
   * @param {Object} canteen - Canteen information
   * @param {Object} preferences - User preferences
   * @returns {number} - Adjusted score
   */
  applyPreferenceAdjustments(baseScore, canteen, preferences) {
    let adjustedScore = baseScore;
    
    // Adjust for favorite canteens
    if (preferences.favoriteCanteens && 
        preferences.favoriteCanteens.includes(canteen.id)) {
      adjustedScore *= 0.9; // 10% reduction in score (better)
    }
    
    // Adjust for preferred food types
    if (preferences.preferredFoodTypes && canteen.foodTypes) {
      const matchingFoodTypes = canteen.foodTypes.filter(
        food => preferences.preferredFoodTypes.includes(food)
      );
      
      if (matchingFoodTypes.length > 0) {
        // Up to 15% reduction based on how many preferred food types match
        const reduction = 0.15 * (matchingFoodTypes.length / canteen.foodTypes.length);
        adjustedScore *= (1 - reduction);
      }
    }
    
    // Adjust for maximum walking distance preference
    if (preferences.maxWalkingDistance && 
        canteen.metrics && 
        canteen.metrics.walkingTime) {
      
      // Convert walking time to approximate distance (5km/h pace)
      const walkingDistance = (canteen.metrics.walkingTime / 60) * 5;
      
      if (walkingDistance > preferences.maxWalkingDistance) {
        adjustedScore *= 1.2; // 20% increase in score (worse)
      }
    }
    
    return adjustedScore;
  }

  // Mock data methods - in a real implementation, these would be API calls to Firebase
  getMockCanteens() {
    return [
      {
        id: "deck",
        name: "The Deck",
        coordinates: { latitude: 1.2937, longitude: 103.7724 },
        nearbyBusStops: ["AS7", "COM2"],
        walkingTimeToBusStops: { "AS7": 2, "COM2": 3 },
        foodTypes: ["Chinese", "Western", "Japanese", "Korean"]
      },
      {
        id: "frontier",
        name: "Frontier",
        coordinates: { latitude: 1.2976, longitude: 103.7811 },
        nearbyBusStops: ["S17", "LT29"],
        walkingTimeToBusStops: { "S17": 1, "LT29": 2 },
        foodTypes: ["Chinese", "Western", "Indian"]
      },
      {
        id: "techno_edge",
        name: "Techno Edge",
        coordinates: { latitude: 1.2988, longitude: 103.7711 },
        nearbyBusStops: ["E3A", "EA"],
        walkingTimeToBusStops: { "E3A": 2, "EA": 3 },
        foodTypes: ["Chinese", "Malay", "Indian", "Western"]
      },
      {
        id: "utown",
        name: "UTown Fine Food",
        coordinates: { latitude: 1.3039, longitude: 103.7741 },
        nearbyBusStops: ["UTown"],
        walkingTimeToBusStops: { "UTown": 1 },
        foodTypes: ["Chinese", "Japanese", "Korean", "Western", "Indian"]
      },
      {
        id: "pgp",
        name: "PGP Foodcourt",
        coordinates: { latitude: 1.2909, longitude: 103.7774 },
        nearbyBusStops: ["KR-MRT", "PGP"],
        walkingTimeToBusStops: { "KR-MRT": 5, "PGP": 1 },
        foodTypes: ["Chinese", "Western", "Drinks"]
      }
    ];
  }

  getMockQueueData() {
    return [
      // The Deck stalls
      {
        stallId: "deck_chinese",
        stallName: "Chinese Cuisine",
        canteenLocation: "The Deck",
        stallCategory: "Chinese",
        queueLength: 8,
        estimatedWaitTime: 16,
        isOpen: true
      },
      {
        stallId: "deck_western",
        stallName: "Western Grill",
        canteenLocation: "The Deck",
        stallCategory: "Western",
        queueLength: 12,
        estimatedWaitTime: 24,
        isOpen: true
      },
      
      // Frontier stalls
      {
        stallId: "frontier_japanese",
        stallName: "Japanese Cuisine",
        canteenLocation: "Frontier",
        stallCategory: "Japanese",
        queueLength: 15,
        estimatedWaitTime: 30,
        isOpen: true
      },
      {
        stallId: "frontier_korean",
        stallName: "Korean BBQ",
        canteenLocation: "Frontier",
        stallCategory: "Korean",
        queueLength: 10,
        estimatedWaitTime: 20,
        isOpen: true
      },
      
      // Techno Edge stalls
      {
        stallId: "techno_indian",
        stallName: "Indian Cuisine",
        canteenLocation: "Techno Edge",
        stallCategory: "Indian",
        queueLength: 5,
        estimatedWaitTime: 10,
        isOpen: true
      },
      {
        stallId: "techno_malay",
        stallName: "Malay Delights",
        canteenLocation: "Techno Edge",
        stallCategory: "Malay",
        queueLength: 3,
        estimatedWaitTime: 6,
        isOpen: true
      },
      
      // UTown stalls
      {
        stallId: "utown_chinese",
        stallName: "Chinese Wok",
        canteenLocation: "UTown Fine Food",
        stallCategory: "Chinese",
        queueLength: 20,
        estimatedWaitTime: 40,
        isOpen: true
      },
      {
        stallId: "utown_western",
        stallName: "Western Delights",
        canteenLocation: "UTown Fine Food",
        stallCategory: "Western",
        queueLength: 18,
        estimatedWaitTime: 36,
        isOpen: true
      },
      
      // PGP stalls
      {
        stallId: "pgp_mixed",
        stallName: "Mixed Rice",
        canteenLocation: "PGP Foodcourt",
        stallCategory: "Chinese",
        queueLength: 7,
        estimatedWaitTime: 14,
        isOpen: true
      },
      {
        stallId: "pgp_drinks",
        stallName: "Beverage Stall",
        canteenLocation: "PGP Foodcourt",
        stallCategory: "Drinks",
        queueLength: 2,
        estimatedWaitTime: 4,
        isOpen: true
      }
    ];
  }

  getMockBusRoutes() {
    return [
      {
        routeId: "A1",
        busNumber: "A1",
        stops: ["KR-MRT", "PGP", "AS7", "COM2", "UTown"],
        frequency: 10, // minutes
        operatingHours: { start: "07:00", end: "23:00" }
      },
      {
        routeId: "A2",
        busNumber: "A2",
        stops: ["UTown", "EA", "E3A", "S17", "LT29"],
        frequency: 12, // minutes
        operatingHours: { start: "07:30", end: "22:30" }
      },
      {
        routeId: "D1",
        busNumber: "D1",
        stops: ["COM2", "S17", "E3A", "UTown"],
        frequency: 8, // minutes
        operatingHours: { start: "07:15", end: "22:45" }
      }
    ];
  }

  getMockBusArrivals(busStopId) {
    const arrivals = {
      "AS7": [
        { busNumber: "A1", estimatedArrival: 3, nextBus: 13 }
      ],
      "COM2": [
        { busNumber: "A1", estimatedArrival: 5, nextBus: 15 },
        { busNumber: "D1", estimatedArrival: 2, nextBus: 10 }
      ],
      "UTown": [
        { busNumber: "A1", estimatedArrival: 8, nextBus: 18 },
        { busNumber: "A2", estimatedArrival: 4, nextBus: 16 },
        { busNumber: "D1", estimatedArrival: 6, nextBus: 14 }
      ],
      "S17": [
        { busNumber: "A2", estimatedArrival: 7, nextBus: 19 },
        { busNumber: "D1", estimatedArrival: 4, nextBus: 12 }
      ],
      "E3A": [
        { busNumber: "A2", estimatedArrival: 9, nextBus: 21 },
        { busNumber: "D1", estimatedArrival: 2, nextBus: 10 }
      ]
    };
    
    return arrivals[busStopId] || [];
  }

  findNearestBusStops(location, limit = 2) {
    const busStops = [
      {
        id: "AS7",
        name: "AS7",
        coordinates: { latitude: 1.2935, longitude: 103.7712 }
      },
      {
        id: "COM2",
        name: "COM2",
        coordinates: { latitude: 1.2945, longitude: 103.7735 }
      },
      {
        id: "S17",
        name: "S17",
        coordinates: { latitude: 1.2977, longitude: 103.7801 }
      },
      {
        id: "LT29",
        name: "LT29",
        coordinates: { latitude: 1.2969, longitude: 103.7815 }
      },
      {
        id: "E3A",
        name: "E3A",
        coordinates: { latitude: 1.2990, longitude: 103.7701 }
      },
      {
        id: "EA",
        name: "EA",
        coordinates: { latitude: 1.3000, longitude: 103.7705 }
      },
      {
        id: "UTown",
        name: "UTown",
        coordinates: { latitude: 1.3040, longitude: 103.7735 }
      },
      {
        id: "KR-MRT",
        name: "Kent Ridge MRT",
        coordinates: { latitude: 1.2935, longitude: 103.7841 }
      },
      {
        id: "PGP",
        name: "PGP",
        coordinates: { latitude: 1.2910, longitude: 103.7770 }
      }
    ];
    
    // Calculate distance to each bus stop
    const stopsWithDistance = busStops.map(stop => ({
      ...stop,
      distance: this.locationService.calculateDistance(location, stop.coordinates)
    }));
    
    // Sort by distance and return the nearest ones
    return stopsWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);
  }
}

export default RecommendationService;
