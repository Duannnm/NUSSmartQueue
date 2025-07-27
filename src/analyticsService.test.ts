
import { AnalyticsService } from './analyticsService';

describe("AnalyticsService", () => {
  let service: AnalyticsService;

  beforeEach(() => {
    (AnalyticsService as any).instance = null; // Reset singleton instance
    service = AnalyticsService.getInstance();
    jest.spyOn(global.Math, "random").mockReturnValue(0.5); // Mock Math.random for consistent results
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns a singleton instance", () => {
    const instance1 = AnalyticsService.getInstance();
    const instance2 = AnalyticsService.getInstance();
    expect(instance1).toBe(instance2);
  });

  describe("generateHourlyAnalytics", () => {
    it("generates hourly analytics for a given stallId", () => {
      const stallId = "test-stall";
      const analytics = service.generateHourlyAnalytics(stallId);
      expect(analytics.length).toBe(24);
      analytics.forEach((data) => {
        expect(data).toHaveProperty("stallId", stallId);
        expect(data).toHaveProperty("date");
        expect(data).toHaveProperty("hour");
        expect(data).toHaveProperty("queueLength");
        expect(data).toHaveProperty("estimatedWaitTime");
        expect(data).toHaveProperty("customersServed");
        expect(data).toHaveProperty("averageServiceTime");
        expect(data).toHaveProperty("peakHours");
        expect(data).toHaveProperty("dayOfWeek");
      });
    });

    it("simulates different queue lengths based on time of day", () => {
      const analytics = service.generateHourlyAnalytics("test-stall");
      // Test for lunch rush (11-14)
      const lunchHour = analytics.find(a => a.hour === 12);
      expect(lunchHour?.queueLength).toBeGreaterThanOrEqual(5); // baseQueue 8 - 3

      // Test for dinner rush (17-19)
      const dinnerHour = analytics.find(a => a.hour === 18);
      expect(dinnerHour?.queueLength).toBeGreaterThanOrEqual(3); // baseQueue 6 - 3

      // Test for breakfast (7-9)
      const breakfastHour = analytics.find(a => a.hour === 8);
      expect(breakfastHour?.queueLength).toBeGreaterThanOrEqual(1); // baseQueue 4 - 3

      // Test for off-peak
      const offPeakHour = analytics.find(a => a.hour === 2);
      expect(offPeakHour?.queueLength).toBeGreaterThanOrEqual(0); // baseQueue 2 - 3 (will be 0)
    });
  });

  describe("generateDailyAnalytics", () => {
    it("generates daily analytics for a given stallId", () => {
      const stallId = "test-stall";
      const analytics = service.generateDailyAnalytics(stallId);
      expect(analytics.length).toBe(7);
      analytics.forEach((data) => {
        expect(data).toHaveProperty("date");
        expect(data).toHaveProperty("totalCustomers");
        expect(data).toHaveProperty("averageQueueLength");
        expect(data).toHaveProperty("averageWaitTime");
        expect(data).toHaveProperty("peakHour");
        expect(data).toHaveProperty("revenue");
        expect(data).toHaveProperty("customerSatisfaction");
      });
    });

    it("simulates different customer numbers for weekdays and weekends", () => {
      const analytics = service.generateDailyAnalytics("test-stall");
      // Assuming Sunday (day 0) and Saturday (day 6) are weekends
      const weekendData = analytics.filter(data => new Date(data.date).getDay() === 0 || new Date(data.date).getDay() === 6);
      const weekdayData = analytics.filter(data => new Date(data.date).getDay() !== 0 && new Date(data.date).getDay() !== 6);

      weekendData.forEach(data => {
        expect(data.totalCustomers).toBeGreaterThanOrEqual(60); // baseCustomers 80 - 20
      });
      weekdayData.forEach(data => {
        expect(data.totalCustomers).toBeGreaterThanOrEqual(100); // baseCustomers 120 - 20
      });
    });
  });

  describe("generateWeeklyAnalytics", () => {
    it("generates weekly analytics for a given stallId", () => {
      const stallId = "test-stall";
      const analytics = service.generateWeeklyAnalytics(stallId);
      expect(analytics.length).toBe(4);
      analytics.forEach((data) => {
        expect(data).toHaveProperty("week");
        expect(data).toHaveProperty("totalCustomers");
        expect(data).toHaveProperty("averageQueueLength");
        expect(data).toHaveProperty("busyDays");
        expect(data).toHaveProperty("quietDays");
        expect(data).toHaveProperty("trends");
        expect(data.trends).toHaveProperty("customerGrowth");
        expect(data.trends).toHaveProperty("queueEfficiency");
      });
    });
  });

  describe("generateVendorInsights", () => {
    it("generates vendor insights and recommendations", () => {
      const stallId = "test-stall";
      const stallName = "Test Stall";
      const insights = service.generateVendorInsights(stallId, stallName);

      expect(insights).toHaveProperty("stallId", stallId);
      expect(insights).toHaveProperty("stallName", stallName);
      expect(insights).toHaveProperty("recommendations");
      expect(insights).toHaveProperty("performanceScore");
      expect(insights).toHaveProperty("comparisonWithPeers");
      expect(insights.comparisonWithPeers).toHaveProperty("queueEfficiency");
      expect(insights.comparisonWithPeers).toHaveProperty("customerVolume");
      expect(insights.comparisonWithPeers).toHaveProperty("serviceSpeed");
    });

    it("provides recommendations based on queue length", () => {
      jest.spyOn(service, "generateHourlyAnalytics").mockReturnValue([
        { queueLength: 7, estimatedWaitTime: 10 } as any, { queueLength: 8, estimatedWaitTime: 10 } as any, { queueLength: 9, estimatedWaitTime: 10 } as any
      ]);
      jest.spyOn(service, "generateDailyAnalytics").mockReturnValue([
        { totalCustomers: 600 } as any
      ]);
      const insights = service.generateVendorInsights("test-stall", "Test Stall");
      expect(insights.recommendations).toContain("Consider adding more staff during peak hours (12-2 PM)");
    });

    it("provides recommendations based on wait time", () => {
      jest.spyOn(service, "generateHourlyAnalytics").mockReturnValue([
        { queueLength: 5, estimatedWaitTime: 16 } as any, { queueLength: 5, estimatedWaitTime: 18 } as any
      ]);
      jest.spyOn(service, "generateDailyAnalytics").mockReturnValue([
        { totalCustomers: 600 } as any
      ]);
      const insights = service.generateVendorInsights("test-stall", "Test Stall");
      expect(insights.recommendations).toContain("Optimize food preparation process to reduce wait times");
    });

    it("provides recommendations based on total customers", () => {
      jest.spyOn(service, "generateHourlyAnalytics").mockReturnValue([
        { queueLength: 2, estimatedWaitTime: 5 } as any
      ]);
      jest.spyOn(service, "generateDailyAnalytics").mockReturnValue([
        { totalCustomers: 100 } as any, { totalCustomers: 150 } as any
      ]);
      const insights = service.generateVendorInsights("test-stall", "Test Stall");
      expect(insights.recommendations).toContain("Consider promotional offers to attract more customers");
    });

    it("provides recommendations based on peak hours", () => {
      jest.spyOn(service, "generateHourlyAnalytics").mockReturnValue([
        { queueLength: 10, estimatedWaitTime: 10 } as any, { queueLength: 12, estimatedWaitTime: 10 } as any, { queueLength: 11, estimatedWaitTime: 10 } as any, { queueLength: 10, estimatedWaitTime: 10 } as any
      ]);
      jest.spyOn(service, "generateDailyAnalytics").mockReturnValue([
        { totalCustomers: 600 } as any
      ]);
      const insights = service.generateVendorInsights("test-stall", "Test Stall");
      expect(insights.recommendations).toContain("Implement queue management system for peak hours");
    });

    it("provides 'Great job!' recommendation if no issues", () => {
      jest.spyOn(service, "generateHourlyAnalytics").mockReturnValue([
        { queueLength: 2, estimatedWaitTime: 5 } as any, { queueLength: 3, estimatedWaitTime: 5 } as any
      ]);
      jest.spyOn(service, "generateDailyAnalytics").mockReturnValue([
        { totalCustomers: 600 } as any, { totalCustomers: 700 } as any
      ]);
      const insights = service.generateVendorInsights("test-stall", "Test Stall");
      expect(insights.recommendations).toContain("Great job! Your stall is performing well across all metrics");
    });

    it("calculates performance score correctly", () => {
      jest.spyOn(service, "generateHourlyAnalytics").mockReturnValue([
        { queueLength: 2, estimatedWaitTime: 5 } as any
      ]);
      jest.spyOn(service, "generateDailyAnalytics").mockReturnValue([
        { totalCustomers: 750 } as any
      ]);
      const insights = service.generateVendorInsights("test-stall", "Test Stall");
      // Expected calculation: ( (100 - 2*10) + (100 - 5*3) + (750/800)*100 ) / 3 = (80 + 85 + 93.75) / 3 = 86.25
      expect(insights.performanceScore).toBe(86); // Rounded
    });

    it("compares with peers correctly", () => {
      jest.spyOn(service, "generateHourlyAnalytics").mockReturnValue([
        { queueLength: 3, estimatedWaitTime: 8 } as any
      ]);
      jest.spyOn(service, "generateDailyAnalytics").mockReturnValue([
        { totalCustomers: 600 } as any
      ]);
      const insights = service.generateVendorInsights("test-stall", "Test Stall");
      expect(insights.comparisonWithPeers.queueEfficiency).toBe("above");
      expect(insights.comparisonWithPeers.customerVolume).toBe("average");
      expect(insights.comparisonWithPeers.serviceSpeed).toBe("above");
    });

    it("compares with peers correctly - average queue efficiency", () => {
      jest.spyOn(service, "generateHourlyAnalytics").mockReturnValue([
        { queueLength: 5, estimatedWaitTime: 8 } as any
      ]);
      jest.spyOn(service, "generateDailyAnalytics").mockReturnValue([
        { totalCustomers: 600 } as any
      ]);
      const insights = service.generateVendorInsights("test-stall", "Test Stall");
      expect(insights.comparisonWithPeers.queueEfficiency).toBe("average");
    });

    it("compares with peers correctly - below queue efficiency", () => {
      jest.spyOn(service, "generateHourlyAnalytics").mockReturnValue([
        { queueLength: 8, estimatedWaitTime: 8 } as any
      ]);
      jest.spyOn(service, "generateDailyAnalytics").mockReturnValue([
        { totalCustomers: 600 } as any
      ]);
      const insights = service.generateVendorInsights("test-stall", "Test Stall");
      expect(insights.comparisonWithPeers.queueEfficiency).toBe("below");
    });

    it("compares with peers correctly - below customer volume", () => {
      jest.spyOn(service, "generateHourlyAnalytics").mockReturnValue([
        { queueLength: 3, estimatedWaitTime: 8 } as any
      ]);
      jest.spyOn(service, "generateDailyAnalytics").mockReturnValue([
        { totalCustomers: 400 } as any
      ]);
      const insights = service.generateVendorInsights("test-stall", "Test Stall");
      expect(insights.comparisonWithPeers.customerVolume).toBe("below");
    });

    it("compares with peers correctly - below service speed", () => {
      jest.spyOn(service, "generateHourlyAnalytics").mockReturnValue([
        { queueLength: 3, estimatedWaitTime: 16 } as any
      ]);
      jest.spyOn(service, "generateDailyAnalytics").mockReturnValue([
        { totalCustomers: 600 } as any
      ]);
      const insights = service.generateVendorInsights("test-stall", "Test Stall");
      expect(insights.comparisonWithPeers.serviceSpeed).toBe("below");
    });
  });

  describe("getRealTimeStats", () => {
    it("returns real-time statistics for a given stallId", () => {
      const stallId = "test-stall";
      const stats = service.getRealTimeStats(stallId);
      expect(stats).toHaveProperty("currentQueue");
      expect(stats).toHaveProperty("estimatedWaitTime");
      expect(stats).toHaveProperty("customersServedToday");
      expect(stats).toHaveProperty("averageServiceTime");
      expect(stats).toHaveProperty("lastUpdated");
    });

    it("simulates different current queue based on time of day", () => {
      // Mock current hour to test different scenarios
      const mockDate = new Date();
      mockDate.setHours(12); // Lunch rush
      jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);
      const statsLunch = service.getRealTimeStats("test-stall");
      expect(statsLunch.currentQueue).toBeGreaterThanOrEqual(6); // baseQueue 8 - 2

      mockDate.setHours(18); // Dinner rush
      jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);
      const statsDinner = service.getRealTimeStats("test-stall");
      expect(statsDinner.currentQueue).toBeGreaterThanOrEqual(4); // baseQueue 6 - 2

      mockDate.setHours(8); // Breakfast
      jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);
      const statsBreakfast = service.getRealTimeStats("test-stall");
      expect(statsBreakfast.currentQueue).toBeGreaterThanOrEqual(2); // baseQueue 4 - 2

      mockDate.setHours(2); // Off-peak
      jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);
      const statsOffPeak = service.getRealTimeStats("test-stall");
      expect(statsOffPeak.currentQueue).toBeGreaterThanOrEqual(0); // baseQueue 2 - 2
    });
  });
});


