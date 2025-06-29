import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <div className="logo-container">
          <h1 className="app-title">NUSmartQueue</h1>
          <p className="app-tagline">Skip the wait, enjoy your meal</p>
        </div>

        <div className="app-description">
          <p>Real-time queue tracking for NUS canteens to help you make informed dining decisions.</p>
        </div>

        <div className="role-selection">
          <h2>I am a:</h2>
          <div className="role-buttons">
            <button 
              className={`role-button ${selectedRole === 'student' ? 'selected' : ''}`}
              onClick={() => handleRoleSelect('student')}
            >
              Student
            </button>
            <button 
              className={`role-button ${selectedRole === 'vendor' ? 'selected' : ''}`}
              onClick={() => handleRoleSelect('vendor')}
            >
              Vendor
            </button>
          </div>
        </div>

        <div className="auth-buttons">
          <Link to={`/login?role=${selectedRole}`} className={`auth-button login ${!selectedRole ? 'disabled' : ''}`} disabled={!selectedRole}>
            Login
          </Link>
          <Link to={`/signup?role=${selectedRole}`} className={`auth-button signup ${!selectedRole ? 'disabled' : ''}`} disabled={!selectedRole}>
            Sign Up
          </Link>
        </div>

        <div className="app-features">
          <h3>Features:</h3>
          <ul>
            <li>Live queue tracking from stall vendors</li>
            <li>Canteen recommendations based on queue lengths</li>
            <li>Predictive analytics for future crowd levels</li>
          </ul>
        </div>

        <footer className="home-footer">
          <p>© 2025 NUSmartQueue - Orbital Project</p>
        </footer>
      </div>
    </div>
  );
};

export default Home;
