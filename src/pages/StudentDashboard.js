import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rtdb, auth } from '../firebase';
import { ref, onValue } from 'firebase/database';
import '../styles/StudentDashboard.css';
import RecommendationService from '../services/RecommendationService';
import LocationService from '../services/LocationService';

const StudentDashboard = () => {
  const [stalls, setStalls] = useState([]);
  const [filteredStalls, setFilteredStalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [filterCanteen, setFilterCanteen] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('waitTime');
  const [favorites, setFavorites] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [locationPermission, setLocationPermission] = useState('pending');
  const [userLocation, setUserLocation] = useState(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  
  const navigate = useNavigate();
  const recommendationService = new RecommendationService();
  const locationService = new LocationService();
  
  // Check authentication and fetch data
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate('/login');
        return;
      }
      
      // Fetch stalls data
      const stallsRef = ref(rtdb, 'stalls');
      onValue(stallsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const stallsList = Object.values(data);
          setStalls(stallsList);
          setFilteredStalls(stallsList);
          setLoading(false);
        }
      });
      
      // Fetch user favorites
      const userFavoritesRef = ref(rtdb, `users/${user.uid}/favorites`);
      onValue(userFavoritesRef, (snapshot) => {
        const favData = snapshot.val();
        if (favData) {
          setFavorites(Object.keys(favData));
        }
      });
      
      // Request location permission
      requestLocationPermission();
    });
    
    return () => unsubscribe();
  }, [navigate]);
  
  // Request location permission and get user location
  const requestLocationPermission = async () => {
    try {
      const permission = await locationService.requestLocationPermission();
      setLocationPermission(permission ? 'granted' : 'denied');
      
      if (permission) {
        const location = await locationService.getCurrentLocation();
        setUserLocation(location);
        generateRecommendations(location);
      }
    } catch (error) {
      console.error('Error requesting location:', error);
      setLocationPermission('denied');
    }
  };
  
  // Generate recommendations based on user location
  const generateRecommendations = async (location) => {
    if (!location) return;
    
    setLoadingRecommendations(true);
    try {
      // Get user preferences (could be fetched from user profile)
      const userPreferences = {
        favoriteCanteens: favorites,
        preferredFoodTypes: [], // Could be populated from user profile
        maxWalkingDistance: 1.5 // km
      };
      
      const recommendedCanteens = await recommendationService.getRecommendations(
        location,
        userPreferences
      );
      
      setRecommendations(recommendedCanteens);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  };
  
  // Filter and sort stalls
  useEffect(() => {
    let result = [...stalls];
    
    // Apply tab filter
    if (activeTab === 'favorites') {
      result = result.filter(stall => favorites.includes(stall.stallId));
    }
    
    // Apply canteen filter
    if (filterCanteen !== 'all') {
      result = result.filter(stall => stall.canteenLocation === filterCanteen);
    }
    
    // Apply category filter
    if (filterCategory !== 'all') {
      result = result.filter(stall => stall.stallCategory === filterCategory);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'waitTime':
          return a.estimatedWaitTime - b.estimatedWaitTime;
        case 'name':
          return a.stallName.localeCompare(b.stallName);
        case 'canteen':
          return a.canteenLocation.localeCompare(b.canteenLocation);
        default:
          return 0;
      }
    });
    
    setFilteredStalls(result);
  }, [stalls, activeTab, filterCanteen, filterCategory, sortBy, favorites]);
  
  // Get unique canteen locations for filter
  const canteenLocations = [...new Set(stalls.map(stall => stall.canteenLocation))];
  
  // Get unique food categories for filter
  const foodCategories = [...new Set(stalls.map(stall => stall.stallCategory))];
  
  // Toggle favorite status
  const toggleFavorite = (stallId) => {
    // This would normally update the database
    if (favorites.includes(stallId)) {
      setFavorites(favorites.filter(id => id !== stallId));
    } else {
      setFavorites([...favorites, stallId]);
    }
  };
  
  // Render wait time with color coding
  const renderWaitTime = (minutes) => {
    let colorClass = 'wait-low';
    if (minutes > 15) {
      colorClass = 'wait-high';
    } else if (minutes > 5) {
      colorClass = 'wait-medium';
    }
    
    return <span className={`wait-time ${colorClass}`}>{minutes} min</span>;
  };
  
  // Render recommendations section
  const renderRecommendations = () => {
    if (locationPermission === 'denied') {
      return (
        <div className="location-permission-card">
          <h3>Enable Location for Recommendations</h3>
          <p>We need your location to recommend the best canteens based on distance and queue times.</p>
          <button className="primary-button" onClick={requestLocationPermission}>
            Enable Location
          </button>
        </div>
      );
    }
    
    if (loadingRecommendations) {
      return <div className="loading-spinner">Generating recommendations...</div>;
    }
    
    if (!recommendations.length) {
      return <p>No recommendations available at this time.</p>;
    }
    
    return (
      <div className="recommendations-container">
        {recommendations.slice(0, 3).map((rec, index) => (
          <div className="recommendation-card" key={index}>
            <div className="recommendation-rank">#{index + 1}</div>
            <div className="recommendation-content">
              <h3>{rec.canteen.name}</h3>
              <div className="recommendation-metrics">
                <div className="metric">
                  <span className="metric-label">Travel:</span>
                  <span className="metric-value">
                    {rec.metrics.travelTime} min ({rec.metrics.travelMethod})
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-label">Wait:</span>
                  <span className="metric-value">
                    {renderWaitTime(rec.metrics.estimatedWaitTime)}
                  </span>
                </div>
                <div className="metric total-time">
                  <span className="metric-label">Total Time:</span>
                  <span className="metric-value">
                    {rec.metrics.totalTime} min
                  </span>
                </div>
              </div>
              <div className="recommendation-reason">
                {index === 0 ? 'Best overall option based on current queues and your location' : 
                 index === 1 ? 'Good alternative with different food options' :
                 'Closest option if you prefer minimal travel time'}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }
  
  return (
    <div className="student-dashboard">
      <header className="dashboard-header">
        <h1>NUSmartQueue</h1>
        <div className="user-controls">
          <button onClick={() => auth.signOut()}>Sign Out</button>
        </div>
      </header>
      
      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          Recommendations
        </button>
        <button 
          className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Stalls
        </button>
        <button 
          className={`tab-button ${activeTab === 'favorites' ? 'active' : ''}`}
          onClick={() => setActiveTab('favorites')}
        >
          Favorites
        </button>
      </div>
      
      {activeTab === 'recommendations' ? (
        <div className="recommendations-section">
          <h2>Recommended Canteens</h2>
          {renderRecommendations()}
        </div>
      ) : (
        <>
          <div className="filters-section">
            <div className="filter-group">
              <label>Canteen:</label>
              <select 
                value={filterCanteen} 
                onChange={(e) => setFilterCanteen(e.target.value)}
              >
                <option value="all">All Canteens</option>
                {canteenLocations.map((location, index) => (
                  <option key={index} value={location}>{location}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Category:</label>
              <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {foodCategories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Sort By:</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="waitTime">Wait Time</option>
                <option value="name">Stall Name</option>
                <option value="canteen">Canteen</option>
              </select>
            </div>
          </div>
          
          <div className="stalls-list">
            {filteredStalls.length === 0 ? (
              <p className="no-results">No stalls match your filters</p>
            ) : (
              filteredStalls.map((stall) => (
                <div 
                  key={stall.stallId} 
                  className={`stall-card ${!stall.isOpen ? 'closed' : ''}`}
                >
                  <div className="stall-header">
                    <h3>{stall.stallName}</h3>
                    <button 
                      className={`favorite-button ${favorites.includes(stall.stallId) ? 'favorited' : ''}`}
                      onClick={() => toggleFavorite(stall.stallId)}
                    >
                      ★
                    </button>
                  </div>
                  
                  <div className="stall-details">
                    <div className="stall-info">
                      <p className="canteen-name">{stall.canteenLocation}</p>
                      <p className="stall-category">{stall.stallCategory}</p>
                    </div>
                    
                    <div className="queue-info">
                      {stall.isOpen ? (
                        <>
                          <p className="queue-length">Queue: {stall.queueLength} people</p>
                          <p className="wait-time-label">Estimated Wait: {renderWaitTime(stall.estimatedWaitTime)}</p>
                        </>
                      ) : (
                        <p className="closed-label">Closed</p>
                      )}
                    </div>
                  </div>
                  
                  {userLocation && stall.isOpen && (
                    <div className="travel-info">
                      <button className="directions-button">Get Directions</button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default StudentDashboard;
