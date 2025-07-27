// NUS Campus coordinates and indoor positioning service

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  building?: string;
  floor?: number;
  zone?: string;
}

export interface CanteenLocation extends Location {
  id: string;
  name: string;
  building: string;
  address: string;
  operatingHours: string;
}

// NUS Campus canteen locations with real coordinates
export const NUS_CANTEENS: CanteenLocation[] = [
  {
    id: 'deck',
    name: 'The Deck',
    building: 'Faculty of Engineering',
    address: 'Engineering Drive 1',
    latitude: 1.2966,
    longitude: 103.7764,
    operatingHours: '7:00 AM - 9:00 PM',
  },
  {
    id: 'fine-food',
    name: 'Fine Food',
    building: 'School of Computing',
    address: 'Computing Drive',
    latitude: 1.2966,
    longitude: 103.7734,
    operatingHours: '7:30 AM - 8:30 PM',
  },
  {
    id: 'techno-edge',
    name: 'Techno Edge',
    building: 'Faculty of Engineering',
    address: 'Engineering Drive 3',
    latitude: 1.2980,
    longitude: 103.7710,
    operatingHours: '7:00 AM - 9:00 PM',
  },
  {
    id: 'arts-canteen',
    name: 'Arts Canteen',
    building: 'Faculty of Arts and Social Sciences',
    address: 'Arts Link',
    latitude: 1.2958,
    longitude: 103.7702,
    operatingHours: '7:30 AM - 8:00 PM',
  },
  {
    id: 'science-canteen',
    name: 'Science Canteen',
    building: 'Faculty of Science',
    address: 'Science Drive 2',
    latitude: 1.2966,
    longitude: 103.7800,
    operatingHours: '7:00 AM - 8:30 PM',
  },
  {
    id: 'frontier',
    name: 'Frontier',
    building: 'S17 (Frontier)',
    address: 'Science Drive 4',
    latitude: 1.2975,
    longitude: 103.7803,
    operatingHours: '7:30 AM - 9:00 PM',
  },
];

// Indoor positioning zones for better accuracy within buildings
export const INDOOR_ZONES = {
  'deck': [
    { zone: 'Level 1 - Food Court', floor: 1, latitude: 1.2966, longitude: 103.7764 },
    { zone: 'Level 2 - Restaurants', floor: 2, latitude: 1.2966, longitude: 103.7765 },
  ],
  'fine-food': [
    { zone: 'Main Dining Area', floor: 1, latitude: 1.2966, longitude: 103.7734 },
    { zone: 'Outdoor Seating', floor: 1, latitude: 1.2967, longitude: 103.7735 },
  ],
  'techno-edge': [
    { zone: 'Food Court', floor: 1, latitude: 1.2980, longitude: 103.7710 },
    { zone: 'Coffee Corner', floor: 1, latitude: 1.2981, longitude: 103.7711 },
  ],
};

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  
  return distance * 1000; // Convert to meters
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate walking time based on distance
 * Average walking speed: 5 km/h = 1.39 m/s
 */
export function calculateWalkingTime(distanceInMeters: number): number {
  const walkingSpeedMps = 1.39; // meters per second
  return Math.ceil(distanceInMeters / walkingSpeedMps / 60); // minutes
}

/**
 * Get nearby canteens sorted by distance
 */
export function getNearbyCanteens(
  userLat: number,
  userLon: number,
  maxDistance: number = 2000 // 2km radius
): Array<CanteenLocation & { distance: number; walkingTime: number }> {
  return NUS_CANTEENS
    .map(canteen => {
      const distance = calculateDistance(userLat, userLon, canteen.latitude, canteen.longitude);
      const walkingTime = calculateWalkingTime(distance);
      
      return {
        ...canteen,
        distance,
        walkingTime,
      };
    })
    .filter(canteen => canteen.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Simulate indoor positioning using WiFi/Bluetooth beacons
 * In a real implementation, this would use actual beacon data
 */
export function simulateIndoorPositioning(
  canteenId: string,
  baseLocation: Location
): Location {
  const zones = INDOOR_ZONES[canteenId as keyof typeof INDOOR_ZONES];
  
  if (!zones || zones.length === 0) {
    return baseLocation;
  }
  
  // Simulate selecting the closest zone based on signal strength
  const selectedZone = zones[Math.floor(Math.random() * zones.length)];
  
  // Add small random offset to simulate positioning accuracy
  const latOffset = (Math.random() - 0.5) * 0.0001; // ~10m accuracy
  const lonOffset = (Math.random() - 0.5) * 0.0001;
  
  return {
    latitude: selectedZone.latitude + latOffset,
    longitude: selectedZone.longitude + lonOffset,
    accuracy: Math.random() * 10 + 5, // 5-15m accuracy
    building: canteenId,
    floor: selectedZone.floor,
    zone: selectedZone.zone,
  };
}

/**
 * Enhanced location service that combines GPS with indoor positioning
 */
export class LocationService {
  private static instance: LocationService;
  private currentLocation: Location | null = null;
  private watchId: number | null = null;
  private callbacks: Array<(location: Location) => void> = [];

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  async getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };

          // Check if user is near a NUS canteen for indoor positioning
          const nearbyCanteen = this.findNearestCanteen(location);
          if (nearbyCanteen && nearbyCanteen.distance < 100) {
            // User is likely inside or very close to a canteen
            const indoorLocation = simulateIndoorPositioning(nearbyCanteen.id, location);
            this.currentLocation = indoorLocation;
            resolve(indoorLocation);
          } else {
            this.currentLocation = location;
            resolve(location);
          }
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }

  startWatching(callback: (location: Location) => void): void {
    this.callbacks.push(callback);

    if (this.watchId === null) {
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };

          const nearbyCanteen = this.findNearestCanteen(location);
          if (nearbyCanteen && nearbyCanteen.distance < 100) {
            const indoorLocation = simulateIndoorPositioning(nearbyCanteen.id, location);
            this.currentLocation = indoorLocation;
            this.notifyCallbacks(indoorLocation);
          } else {
            this.currentLocation = location;
            this.notifyCallbacks(location);
          }
        },
        (error) => {
          console.error('Location watch error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    }
  }

  stopWatching(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.callbacks = [];
  }

  private findNearestCanteen(location: Location) {
    const nearby = getNearbyCanteens(location.latitude, location.longitude, 500);
    return nearby.length > 0 ? nearby[0] : null;
  }

  private notifyCallbacks(location: Location): void {
    this.callbacks.forEach(callback => callback(location));
  }

  getCanteenById(id: string): CanteenLocation | undefined {
    return NUS_CANTEENS.find(canteen => canteen.id === id);
  }

  getAllCanteens(): CanteenLocation[] {
    return NUS_CANTEENS;
  }
}

