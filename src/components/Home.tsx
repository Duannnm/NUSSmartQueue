import React from 'react';
import { 
  MapPin, 
  BarChart3, 
  Target, 
  Users, 
  Clock, 
  Star,
  Smartphone,
  TrendingUp,
  Navigation,
  Zap,
  Utensils,
  ArrowRight
} from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const features = [
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Indoor Positioning",
      description: "Advanced location services with precise indoor positioning using WiFi and Bluetooth beacons."
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Smart Recommendations",
      description: "AI-powered suggestions based on distance, crowd levels, and your preferences."
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Vendor Analytics",
      description: "Comprehensive dashboard with real-time insights and performance metrics."
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Real-time Updates",
      description: "Live queue information and wait times updated by vendors in real-time."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="text-center">
            <div className="mb-8">
              <div className="inline-flex items-center space-x-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm font-medium">
                <Zap className="h-4 w-4" />
                <span>Enhanced with MS3 Features</span>
              </div>
            </div>
            
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl">
                <Utensils className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              NUS<span className="text-blue-200">SmartQueue</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto">
              Revolutionizing campus dining with intelligent queue management, 
              advanced location services, and data-driven insights.
            </p>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <button
                onClick={() => onNavigate('login')}
                className="group bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Users className="h-5 w-5" />
                <span>I'm a Student</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => onNavigate('login')}
                className="group bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-800 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <BarChart3 className="h-5 w-5" />
                <span>I'm a Vendor</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="text-center">
              <p className="text-blue-200 mb-4">New to NUSmartQueue?</p>
              <button
                onClick={() => onNavigate('signup')}
                className="text-white hover:text-blue-200 font-medium underline underline-offset-4 hover:underline-offset-8 transition-all duration-300"
              >
                Create an Account
              </button>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white bg-opacity-10 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-white bg-opacity-10 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 bg-white bg-opacity-10 rounded-full animate-pulse delay-2000"></div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Enhanced Features for MS3
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the next generation of campus dining management with our advanced features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-lg mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">15+</div>
              <div className="text-gray-600">Campus Canteens</div>
            </div>
            <div className="p-6">
              <div className="text-3xl lg:text-4xl font-bold text-green-600 mb-2">50+</div>
              <div className="text-gray-600">Food Stalls</div>
            </div>
            <div className="p-6">
              <div className="text-3xl lg:text-4xl font-bold text-purple-600 mb-2">5m</div>
              <div className="text-gray-600">Indoor Accuracy</div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple steps to optimize your campus dining experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Check Your Location
              </h3>
              <p className="text-gray-600">
                Our advanced positioning system detects your exact location on campus, even indoors.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Get Smart Recommendations
              </h3>
              <p className="text-gray-600">
                Receive personalized suggestions based on distance, wait times, and crowd levels.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 text-purple-600 rounded-full text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Enjoy Your Meal
              </h3>
              <p className="text-gray-600">
                Navigate to your chosen stall with confidence and minimal wait time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Section */}
      <div className="bg-blue-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-center mb-4">
              <Smartphone className="h-8 w-8 text-blue-600 mr-2" />
              <h3 className="text-2xl font-bold text-gray-900">Demo Mode Available</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Explore all features with our comprehensive demo data. No setup required!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center justify-center space-x-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>Real-time queue simulation</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Navigation className="h-4 w-4 text-blue-500" />
                <span>Interactive location services</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span>Comprehensive analytics</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Target className="h-4 w-4 text-purple-500" />
                <span>Smart recommendations</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

