import { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import './App.css';
import Home from './components/Home';
import Login from './components/Login';
import SignUp from './components/SignUp';
import StudentDashboard from './components/StudentDashboard';
import VendorDashboard from './components/VendorDashboard';

type Page = 'home' | 'login' | 'signup' | 'student-dashboard' | 'vendor-dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // In a real app, you'd fetch the user role from Firestore
        // For demo purposes, we'll use a simple check
        const role = user.email?.includes('vendor') ? 'vendor' : 'student';
        setCurrentPage(role === 'vendor' ? 'vendor-dashboard' : 'student-dashboard');
      } else {
        setCurrentPage('home');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="app-container flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={(page) => setCurrentPage(page as Page)} />;
      case 'login':
        return <Login onNavigate={(page) => setCurrentPage(page as Page)} />;
      case 'signup':
        return <SignUp onNavigate={(page) => setCurrentPage(page as Page)} />;
      case 'student-dashboard':
        return <StudentDashboard onNavigate={(page) => setCurrentPage(page as Page)} user={user} />;
      case 'vendor-dashboard':
        return <VendorDashboard onNavigate={(page) => setCurrentPage(page as Page)} user={user} />;
      default:
        return <Home onNavigate={(page) => setCurrentPage(page as Page)} />;
    }
  };

  return (
    <div className="app-container">
      {renderPage()}
    </div>
  );
}

export default App;

