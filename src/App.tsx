import { useState } from 'react';
import './App.css';

// Import existing components
import Home from './components/Home';
import Login from './components/Login';
import SignUp from './components/SignUp';
import VendorDashboard from './components/VendorDashboard';
import EnhancedStudentDashboard from './components/EnhancedStudentDashboard';
import CanteenDetails from './components/CanteenDetails';
import ErrorBoundary from './components/ErrorBoundary';

// Simple notification state
interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedCanteen, setSelectedCanteen] = useState(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const navigate = (page: string, data?: any) => {
    setCurrentPage(page);
    if (data) {
      setSelectedCanteen(data);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <Login onNavigate={navigate} />;
      case 'signup':
        return <SignUp onNavigate={navigate} />;
      case 'student-dashboard':
        return <EnhancedStudentDashboard onNavigate={navigate} />;
      case 'vendor-dashboard':
        return <VendorDashboard user={null} onNavigate={navigate} />;
      case 'canteen-details':
        return selectedCanteen ? (
          <CanteenDetails canteen={selectedCanteen} onNavigate={navigate} />
        ) : (
          <Home onNavigate={navigate} />
        );
      default:
        return <Home onNavigate={navigate} />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="App">
        {renderPage()}
        
        {/* Simple notification display */}
        {notifications.length > 0 && (
          <div className="fixed top-4 right-4 z-50 space-y-2">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg shadow-lg max-w-sm ${
                  notification.type === 'success' ? 'bg-green-500 text-white' :
                  notification.type === 'error' ? 'bg-red-500 text-white' :
                  notification.type === 'warning' ? 'bg-yellow-500 text-white' :
                  'bg-blue-500 text-white'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{notification.title}</h4>
                    {notification.message && (
                      <p className="text-sm mt-1">{notification.message}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="ml-2 text-white hover:text-gray-200"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;

