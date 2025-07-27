import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Star,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Calendar,
  Target,
} from 'lucide-react';
import { AnalyticsService, DailyAnalytics, QueueAnalytics, VendorInsights } from '../services/analyticsService';

interface VendorAnalyticsProps {
  stallId: string;
  stallName: string;
}

const VendorAnalytics: React.FC<VendorAnalyticsProps> = ({ stallId, stallName }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'hourly' | 'daily' | 'insights'>('overview');
  const [hourlyData, setHourlyData] = useState<QueueAnalytics[]>([]);
  const [dailyData, setDailyData] = useState<DailyAnalytics[]>([]);
  const [insights, setInsights] = useState<VendorInsights | null>(null);
  const [realTimeStats, setRealTimeStats] = useState<any>(null);

  const analyticsService = AnalyticsService.getInstance();

  useEffect(() => {
    // Load analytics data
    setHourlyData(analyticsService.generateHourlyAnalytics(stallId));
    setDailyData(analyticsService.generateDailyAnalytics(stallId));
    setInsights(analyticsService.generateVendorInsights(stallId, stallName));
    setRealTimeStats(analyticsService.getRealTimeStats(stallId));

    // Update real-time stats every 30 seconds
    const interval = setInterval(() => {
      setRealTimeStats(analyticsService.getRealTimeStats(stallId));
    }, 30000);

    return () => clearInterval(interval);
  }, [stallId, stallName]);

  const formatTime = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComparisonIcon = (comparison: 'above' | 'average' | 'below') => {
    switch (comparison) {
      case 'above':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'below':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-500" />;
    }
  };

  const pieData = dailyData.map((day, index) => ({
    name: formatDate(day.date),
    value: day.totalCustomers,
    fill: `hsl(${index * 50}, 70%, 50%)`,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics Dashboard</h2>
        <p className="text-gray-600">{stallName} - Performance Insights</p>
      </div>

      {/* Real-time Stats */}
      {realTimeStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Queue</p>
                <p className="text-2xl font-bold text-blue-600">{realTimeStats.currentQueue}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Est. Wait Time</p>
                <p className="text-2xl font-bold text-orange-600">{realTimeStats.estimatedWaitTime}m</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Served Today</p>
                <p className="text-2xl font-bold text-green-600">{realTimeStats.customersServedToday}</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Service Time</p>
                <p className="text-2xl font-bold text-purple-600">{realTimeStats.averageServiceTime.toFixed(1)}m</p>
              </div>
              <Star className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'hourly', label: 'Hourly Trends', icon: Clock },
              { id: 'daily', label: 'Daily Analysis', icon: Calendar },
              { id: 'insights', label: 'Insights', icon: Target },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Queue Length Trend */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Queue Length (Last 24 Hours)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={hourlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" tickFormatter={formatTime} />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(value) => `Time: ${formatTime(value as number)}`}
                        formatter={(value: any) => [value, 'Queue Length']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="queueLength" 
                        stroke="#3B82F6" 
                        fill="#3B82F6" 
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Daily Customers */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Customer Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Hourly Tab */}
          {activeTab === 'hourly' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Hourly Performance Metrics</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" tickFormatter={formatTime} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    labelFormatter={(value) => `Time: ${formatTime(value as number)}`}
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="queueLength" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    name="Queue Length"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="estimatedWaitTime" 
                    stroke="#EF4444" 
                    strokeWidth={2}
                    name="Wait Time (min)"
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="customersServed" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="Customers Served"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Daily Tab */}
          {activeTab === 'daily' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Performance (Last 7 Days)</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatDate} />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => `Date: ${formatDate(value as string)}`}
                  />
                  <Bar dataKey="totalCustomers" fill="#3B82F6" name="Total Customers" />
                  <Bar dataKey="averageQueueLength" fill="#EF4444" name="Avg Queue Length" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && insights && (
            <div className="space-y-6">
              {/* Performance Score */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Performance Score</h3>
                  <div className={`text-3xl font-bold ${getPerformanceColor(insights.performanceScore)}`}>
                    {insights.performanceScore}/100
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${
                      insights.performanceScore >= 80 ? 'bg-green-500' :
                      insights.performanceScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${insights.performanceScore}%` }}
                  ></div>
                </div>
              </div>

              {/* Peer Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Queue Efficiency</span>
                    {getComparisonIcon(insights.comparisonWithPeers.queueEfficiency)}
                  </div>
                  <p className="text-lg font-medium capitalize">{insights.comparisonWithPeers.queueEfficiency} Average</p>
                </div>
                
                <div className="bg-white border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Customer Volume</span>
                    {getComparisonIcon(insights.comparisonWithPeers.customerVolume)}
                  </div>
                  <p className="text-lg font-medium capitalize">{insights.comparisonWithPeers.customerVolume} Average</p>
                </div>
                
                <div className="bg-white border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Service Speed</span>
                    {getComparisonIcon(insights.comparisonWithPeers.serviceSpeed)}
                  </div>
                  <p className="text-lg font-medium capitalize">{insights.comparisonWithPeers.serviceSpeed} Average</p>
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recommendations</h3>
                <div className="space-y-3">
                  {insights.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                      {recommendation.includes('Great job') ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                      )}
                      <p className="text-sm text-gray-700">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorAnalytics;

