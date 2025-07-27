
import { LocationService, calculateDistance, calculateWalkingTime, getNearbyCanteens, NUS_CANTEENS, simulateIndoorPositioning } from './locationService';

describe("LocationService", () => {
  let service: LocationService;

  beforeEach(() => {
    service = LocationService.getInstance();
    // Reset the singleton instance before each test to ensure isolation
    (LocationService as any).instance = null;
    service = LocationService.getInstance();

    // Mock navigator.geolocation
    Object.defineProperty(global.navigator, 'geolocation', {
      value: {
        getCurrentPosition: jest.fn(),
        watchPosition: jest.fn(),
        clearWatch: jest.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns a singleton instance", () => {
    const instance1 = LocationService.getInstance();
    const instance2 = LocationService.getInstance();
    expect(instance1).toBe(instance2);
  });

  describe("getCurrentLocation", () => {
    it("resolves with current location on success", async () => {
      const mockPosition = {
        coords: { latitude: 1.2966, longitude: 103.7764, accuracy: 10 },
      } as GeolocationPosition;

      (navigator.geolocation.getCurrentPosition as jest.Mock).mockImplementationOnce((successCallback) => {
        successCallback(mockPosition);
      });

      const location = await service.getCurrentLocation();
      expect(location).toEqual({
        latitude: mockPosition.coords.latitude,
        longitude: mockPosition.coords.longitude,
        accuracy: mockPosition.coords.accuracy,
      });
      expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalledTimes(1);
    });

    it("rejects with error on failure", async () => {
      const mockError = new Error("User denied geolocation");

      (navigator.geolocation.getCurrentPosition as jest.Mock).mockImplementationOnce((successCallback, errorCallback) => {
        errorCallback(mockError);
      });

      await expect(service.getCurrentLocation()).rejects.toThrow("User denied geolocation");
    });

    it("returns indoor location if near a canteen", async () => {
      const mockPosition = {
        coords: { latitude: 1.2966, longitude: 103.7764, accuracy: 10 },
      } as GeolocationPosition;

      (navigator.geolocation.getCurrentPosition as jest.Mock).mockImplementationOnce((successCallback) => {
        successCallback(mockPosition);
      });

      // Mock findNearestCanteen to return a canteen within range
      jest.spyOn(service as any, 'findNearestCanteen').mockReturnValueOnce({
        id: 'deck',
        name: 'The Deck',
        building: 'Faculty of Engineering',
        address: 'Engineering Drive 1',
        latitude: 1.2966,
        longitude: 103.7764,
        operatingHours: '7:00 AM - 9:00 PM',
        distance: 50, // within 100m
      });

      // Mock simulateIndoorPositioning
      jest.spyOn(global as any, 'simulateIndoorPositioning').mockReturnValueOnce({
        latitude: 1.2966, longitude: 103.7764, accuracy: 8, building: 'deck', floor: 1, zone: 'Level 1 - Food Court'
      });

      const location = await service.getCurrentLocation();
      expect(location).toHaveProperty('building', 'deck');
      expect(location).toHaveProperty('floor', 1);
      expect(location).toHaveProperty('zone', 'Level 1 - Food Court');
    });

    it('rejects if geolocation is not supported', async () => {
      Object.defineProperty(global.navigator, 'geolocation', {
        value: undefined,
        writable: true,
      });
      await expect(service.getCurrentLocation()).rejects.toThrow('Geolocation is not supported');
    });
  });

  describe("startWatching and stopWatching", () => {
    it("starts watching position and notifies callbacks", () => {
      const mockCallback = jest.fn();
      service.startWatching(mockCallback);

      expect(navigator.geolocation.watchPosition).toHaveBeenCalledTimes(1);

      const successCallback = (navigator.geolocation.watchPosition as jest.Mock).mock.calls[0][0];
      const mockPosition = {
        coords: { latitude: 1.2966, longitude: 103.7764, accuracy: 10 },
      } as GeolocationPosition;
      successCallback(mockPosition);

      expect(mockCallback).toHaveBeenCalledWith({
        latitude: mockPosition.coords.latitude,
        longitude: mockPosition.coords.longitude,
        accuracy: mockPosition.coords.accuracy,
      });
    });

    it("stops watching position", () => {
      service.startWatching(jest.fn());
      service.stopWatching();
      expect(navigator.geolocation.clearWatch).toHaveBeenCalledTimes(1);
    });

    it("notifies multiple callbacks", () => {
      const mockCallback1 = jest.fn();
      const mockCallback2 = jest.fn();
      service.startWatching(mockCallback1);
      service.startWatching(mockCallback2);

      const successCallback = (navigator.geolocation.watchPosition as jest.Mock).mock.calls[0][0];
      const mockPosition = {
        coords: { latitude: 1.2966, longitude: 103.7764, accuracy: 10 },
      } as GeolocationPosition;
      successCallback(mockPosition);

      expect(mockCallback1).toHaveBeenCalledTimes(1);
      expect(mockCallback2).toHaveBeenCalledTimes(1);
    });

    it("handles watch error", () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      service.startWatching(jest.fn());

      const errorCallback = (navigator.geolocation.watchPosition as jest.Mock).mock.calls[0][1];
      const mockError = new Error("Watch error");
      errorCallback(mockError);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Location watch error:', mockError);
      consoleErrorSpy.mockRestore();
    });

    it('uses indoor positioning for watchPosition if near canteen', () => {
      const mockCallback = jest.fn();
      service.startWatching(mockCallback);

      jest.spyOn(service as any, 'findNearestCanteen').mockReturnValueOnce({
        id: 'deck',
        distance: 50,
      });
      jest.spyOn(global as any, 'simulateIndoorPositioning').mockReturnValueOnce({
        latitude: 1.2966, longitude: 103.7764, accuracy: 8, building: 'deck', floor: 1, zone: 'Level 1 - Food Court'
      });

      const successCallback = (navigator.geolocation.watchPosition as jest.Mock).mock.calls[0][0];
      const mockPosition = {
        coords: { latitude: 1.2966, longitude: 103.7764, accuracy: 10 },
      } as GeolocationPosition;
      successCallback(mockPosition);

      expect(mockCallback).toHaveBeenCalledWith(expect.objectContaining({
        building: 'deck',
        floor: 1,
        zone: 'Level 1 - Food Court',
      }));
    });
  });

  describe("getCanteenById", () => {
    it("returns canteen by ID", () => {
      const canteen = service.getCanteenById('deck');
      expect(canteen).toBeDefined();
      expect(canteen?.id).toBe('deck');
    });

    it("returns undefined for non-existent ID", () => {
      const canteen = service.getCanteenById('non-existent');
      expect(canteen).toBeUndefined();
    });
  });

  describe("getAllCanteens", () => {
    it("returns all canteens", () => {
      const canteens = service.getAllCanteens();
      expect(canteens).toEqual(NUS_CANTEENS);
    });
  });

  describe("simulateIndoorPositioning", () => {
    it("returns base location if no zones defined", () => {
      const baseLocation = { latitude: 1, longitude: 1 };
      const result = simulateIndoorPositioning('non-existent-canteen', baseLocation);
      expect(result).toEqual(baseLocation);
    });

    it("returns a location within the canteen with offsets", () => {
      const baseLocation = { latitude: 1.2966, longitude: 103.7764 };
      const result = simulateIndoorPositioning('deck', baseLocation);
      expect(result.latitude).toBeCloseTo(1.2966, 3);
      expect(result.longitude).toBeCloseTo(103.7764, 3);
      expect(result).toHaveProperty('accuracy');
      expect(result).toHaveProperty('building', 'deck');
      expect(result).toHaveProperty('floor');
      expect(result).toHaveProperty('zone');
    });
  });

  describe("calculateDistance", () => {
    it("calculates distance between two points", () => {
      const distance = calculateDistance(1.2966, 103.7764, 1.2967, 103.7765);
      expect(distance).toBeCloseTo(15.7, 1);
    });
  });

  describe("calculateWalkingTime", () => {
    it("calculates walking time from distance", () => {
      const walkingTime = calculateWalkingTime(100);
      expect(walkingTime).toBe(2); // 100m / 1.39m/s / 60s/min = 1.19 min, ceil to 2
    });
  });

  describe("getNearbyCanteens", () => {
    it("returns canteens within max distance", () => {
      const nearby = getNearbyCanteens(1.2966, 103.7764, 50);
      expect(nearby.length).toBeGreaterThan(0);
      expect(nearby[0].id).toBe('deck');
    });

    it("returns empty array if no canteens within distance", () => {
      const nearby = getNearbyCanteens(0, 0, 10);
      expect(nearby.length).toBe(0);
    });

    it("sorts canteens by distance", () => {
      const nearby = getNearbyCanteens(1.2966, 103.7764, 2000);
      expect(nearby.length).toBeGreaterThan(1);
      expect(nearby[0].distance).toBeLessThanOrEqual(nearby[1].distance);
    });
  });
});


