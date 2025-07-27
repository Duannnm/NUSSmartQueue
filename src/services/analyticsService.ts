// Analytics service for vendor dashboard

export interface QueueAnalytics {
  stallId: string;
  date: string;
  hour: number;
  queueLength: number;
  estimatedWaitTime: number;
  customersServed: number;
  averageServiceTime: number;
  peakHours: number[];
  dayOfWeek: string;
}

export interface DailyAnalytics {
  date: string;
  totalCustomers: number;
  averageQueueLength: number;
  averageWaitTime: number;
  peakHour: number;
  revenue?: number;
  customerSatisfaction?: number;
}

export interface WeeklyAnalytics {
  week: string;
  totalCustomers: number;
  averageQueueLength: number;
  busyDays: string[];
  quietDays: string[];
  trends: {
    customerGrowth: number;
    queueEfficiency: number;
  };
}

export interface VendorInsights {
  stallId: string;
  stallName: string;
  recommendations: string[];
  performanceScore: number;
  comparisonWithPeers: {
    queueEfficiency: 'above' | 'average' | 'below';
    customerVolume: 'above' | 'average' | 'below';
    serviceSpeed: 'above' | 'average' | 'below';
  };
}

// Mock analytics data generator for demonstration
export class AnalyticsService {
  private static instance: AnalyticsService;

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // Generate hourly analytics for the past 24 hours
  generateHourlyAnalytics(stallId: string): QueueAnalytics[] {
    const analytics: QueueAnalytics[] = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourOfDay = hour.getHours();
      
      // Simulate realistic queue patterns
      let baseQueue = 2;
      if (hourOfDay >= 11 && hourOfDay <= 14) baseQueue = 8; // Lunch rush
      if (hourOfDay >= 17 && hourOfDay <= 19) baseQueue = 6; // Dinner rush
      if (hourOfDay >= 7 && hourOfDay <= 9) baseQueue = 4;   // Breakfast
      
      const queueLength = Math.max(0, baseQueue + Math.floor(Math.random() * 6) - 3);
      const estimatedWaitTime = queueLength * (3 + Math.random() * 2); // 3-5 min per person
      const customersServed = Math.floor(queueLength * 1.5 + Math.random() * 10);
      
      analytics.push({
        stallId,
        date: hour.toISOString().split('T')[0],
        hour: hourOfDay,
        queueLength,
        estimatedWaitTime: Math.round(estimatedWaitTime),
        customersServed,
        averageServiceTime: 3 + Math.random() * 2,
        peakHours: [12, 13, 18],
        dayOfWeek: hour.toLocaleDateString('en-US', { weekday: 'long' }),
      });
    }
    
    return analytics;
  }

  // Generate daily analytics for the past 7 days
  generateDailyAnalytics(stallId: string): DailyAnalytics[] {
    const analytics: DailyAnalytics[] = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayOfWeek = date.getDay();
      
      // Weekend vs weekday patterns
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const baseCustomers = isWeekend ? 80 : 120;
      
      const totalCustomers = baseCustomers + Math.floor(Math.random() * 40) - 20;
      const averageQueueLength = Math.max(1, 5 + Math.floor(Math.random() * 6) - 3);
      const averageWaitTime = averageQueueLength * (3 + Math.random());
      
      analytics.push({
        date: date.toISOString().split('T')[0],
        totalCustomers,
        averageQueueLength,
        averageWaitTime: Math.round(averageWaitTime),
        peakHour: 12 + Math.floor(Math.random() * 2), // 12 or 1 PM
        revenue: totalCustomers * (8 + Math.random() * 4), // $8-12 per customer
        customerSatisfaction: 3.5 + Math.random() * 1.5, // 3.5-5.0 rating
      });
    }
    
    return analytics;
  }

  // Generate weekly analytics for the past 4 weeks
  generateWeeklyAnalytics(stallId: string): WeeklyAnalytics[] {
    const analytics: WeeklyAnalytics[] = [];
    const now = new Date();
    
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
      
      const totalCustomers = 600 + Math.floor(Math.random() * 200) - 100;
      const averageQueueLength = 4 + Math.random() * 3;
      
      analytics.push({
        week: `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        totalCustomers,
        averageQueueLength: Math.round(averageQueueLength * 10) / 10,
        busyDays: ['Monday', 'Tuesday', 'Wednesday'],
        quietDays: ['Saturday', 'Sunday'],
        trends: {
          customerGrowth: (Math.random() - 0.5) * 20, // -10% to +10%
          queueEfficiency: (Math.random() - 0.3) * 15, // Slight positive bias
        },
      });
    }
    
    return analytics;
  }

  // Generate vendor insights and recommendations
  generateVendorInsights(stallId: string, stallName: string): VendorInsights {
    const hourlyData = this.generateHourlyAnalytics(stallId);
    const dailyData = this.generateDailyAnalytics(stallId);
    
    const avgQueueLength = hourlyData.reduce((sum, h) => sum + h.queueLength, 0) / hourlyData.length;
    const avgWaitTime = hourlyData.reduce((sum, h) => sum + h.estimatedWaitTime, 0) / hourlyData.length;
    const totalCustomers = dailyData.reduce((sum, d) => sum + d.totalCustomers, 0);
    
    const recommendations: string[] = [];
    
    if (avgQueueLength > 6) {
      recommendations.push('Consider adding more staff during peak hours (12-2 PM)');
    }
    
    if (avgWaitTime > 15) {
      recommendations.push('Optimize food preparation process to reduce wait times');
    }
    
    if (totalCustomers < 500) {
      recommendations.push('Consider promotional offers to attract more customers');
    }
    
    const peakHours = hourlyData.filter(h => h.queueLength > avgQueueLength + 2);
    if (peakHours.length > 3) {
      recommendations.push('Implement queue management system for peak hours');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Great job! Your stall is performing well across all metrics');
    }
    
    // Calculate performance score (0-100)
    const queueEfficiencyScore = Math.max(0, 100 - avgQueueLength * 10);
    const waitTimeScore = Math.max(0, 100 - avgWaitTime * 3);
    const customerVolumeScore = Math.min(100, (totalCustomers / 800) * 100);
    const performanceScore = Math.round((queueEfficiencyScore + waitTimeScore + customerVolumeScore) / 3);
    
    return {
      stallId,
      stallName,
      recommendations,
      performanceScore,
      comparisonWithPeers: {
        queueEfficiency: avgQueueLength < 4 ? 'above' : avgQueueLength < 7 ? 'average' : 'below',
        customerVolume: totalCustomers > 700 ? 'above' : totalCustomers > 500 ? 'average' : 'below',
        serviceSpeed: avgWaitTime < 10 ? 'above' : avgWaitTime < 15 ? 'average' : 'below',
      },
    };
  }

  // Get real-time queue statistics
  getRealTimeStats(stallId: string) {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Simulate current queue based on time of day
    let currentQueue = 2;
    if (currentHour >= 11 && currentHour <= 14) currentQueue = 8;
    if (currentHour >= 17 && currentHour <= 19) currentQueue = 6;
    if (currentHour >= 7 && currentHour <= 9) currentQueue = 4;
    
    currentQueue = Math.max(0, currentQueue + Math.floor(Math.random() * 4) - 2);
    
    return {
      currentQueue,
      estimatedWaitTime: Math.round(currentQueue * (3 + Math.random())),
      customersServedToday: Math.floor(Math.random() * 50) + 30,
      averageServiceTime: 3 + Math.random() * 2,
      lastUpdated: now.toISOString(),
    };
  }
}

