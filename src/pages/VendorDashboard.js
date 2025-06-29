import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { ref, onValue, update } from 'firebase/database';
import { auth, db, rtdb } from '../firebase';
import '../styles/VendorDashboard.css';

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState(null);
  const [stall, setStall] = useState(null);
  const [queueData, setQueueData] = useState({
    queueLength: 0,
    estimatedWaitTime: 0,
    isOpen: true,
    lastUpdated: new Date().toISOString()
  });

  // Authentication check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Fetch user data from Firestore
        getVendorData(user.uid);
      } else {
        // Redirect to login if not authenticated
        navigate('/login?role=vendor');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Fetch vendor data from Firestore
  const getVendorData = async (uid) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists() && userDoc.data().role === 'vendor') {
        const userData = userDoc.data();
        setVendor(userData);
        
        // Check if vendor has a stall
        if (userData.stallId) {
          fetchStallData(userData.stallId);
        } else {
          // Create a new stall for the vendor
          createNewStall(uid, userData);
        }
      } else {
        // Redirect if not a vendor
        navigate('/login?role=vendor');
      }
    } catch (error) {
      console.error('Error fetching vendor data:', error);
      setLoading(false);
    }
  };

  // Fetch stall data from Realtime Database
  const fetchStallData = (stallId) => {
    const stallRef = ref(rtdb, `stalls/${stallId}`);
    
    onValue(stallRef, (snapshot) => {
      if (snapshot.exists()) {
        const stallData = snapshot.val();
        setStall(stallData);
        setQueueData({
          queueLength: stallData.queueLength || 0,
          estimatedWaitTime: stallData.estimatedWaitTime || 0,
          isOpen: stallData.isOpen !== undefined ? stallData.isOpen : true,
          lastUpdated: stallData.lastUpdated || new Date().toISOString()
        });
      }
      setLoading(false);
    });
  };

  // Create a new stall for the vendor
  const createNewStall = async (uid, userData) => {
    try {
      const stallId = `stall_${uid}`;
      const newStall = {
        stallId,
        vendorId: uid,
        stallName: userData.stallName || 'Unnamed Stall',
        canteenLocation: userData.canteenLocation || 'Unknown Location',
        stallCategory: userData.stallCategory || 'Other',
        queueLength: 0,
        estimatedWaitTime: 0,
        isOpen: true,
        lastUpdated: new Date().toISOString()
      };
      
      // Update Realtime Database
      const stallRef = ref(rtdb, `stalls/${stallId}`);
      await update(stallRef, newStall);
      
      // Update vendor document with stallId
      const vendorRef = doc(db, 'users', uid);
      await update(vendorRef, { stallId });
      
      // Fetch the newly created stall
      fetchStallData(stallId);
    } catch (error) {
      console.error('Error creating stall:', error);
      setLoading(false);
    }
  };

  // Update queue length
  const updateQueueLength = async (change) => {
    if (!stall) return;
    
    const newLength = Math.max(0, queueData.queueLength + change);
    const newWaitTime = calculateWaitTime(newLength);
    
    setQueueData(prev => ({
      ...prev,
      queueLength: newLength,
      estimatedWaitTime: newWaitTime,
      lastUpdated: new Date().toISOString()
    }));
    
    // Update Realtime Database
    const stallRef = ref(rtdb, `stalls/${stall.stallId}`);
    await update(stallRef, {
      queueLength: newLength,
      estimatedWaitTime: newWaitTime,
      lastUpdated: new Date().toISOString()
    });
  };

  // Toggle stall open/closed status
  const toggleStallStatus = async () => {
    if (!stall) return;
    
    const newStatus = !queueData.isOpen;
    
    setQueueData(prev => ({
      ...prev,
      isOpen: newStatus,
      lastUpdated: new Date().toISOString()
    }));
    
    // Update Realtime Database
    const stallRef = ref(rtdb, `stalls/${stall.stallId}`);
    await update(stallRef, {
      isOpen: newStatus,
      lastUpdated: new Date().toISOString()
    });
  };

  // Calculate estimated wait time based on queue length
  const calculateWaitTime = (queueLength) => {
    // Simple calculation: 2 minutes per person in queue
    return queueLength * 2;
  };

  // Format timestamp to readable time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handle sign out
  const handleSignOut = () => {
    auth.signOut().then(() => {
      navigate('/');
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="vendor-dashboard">
      <header className="dashboard-header">
        <h1>Vendor Dashboard</h1>
        <button className="sign-out-button" onClick={handleSignOut}>Sign Out</button>
      </header>

      <div className="vendor-info">
        <h2>Welcome, {vendor?.name || 'Vendor'}</h2>
        <div className="stall-info">
          <h3>{stall?.stallName || 'Your Stall'}</h3>
          <p>Location: {stall?.canteenLocation || 'Not specified'}</p>
          <p>Category: {stall?.stallCategory || 'Not specified'}</p>
        </div>
      </div>

      <div className="queue-management">
        <h3>Queue Management</h3>
        
        <div className="status-toggle">
          <span>Stall Status:</span>
          <button 
            className={`status-button ${queueData.isOpen ? 'open' : 'closed'}`}
            onClick={toggleStallStatus}
          >
            {queueData.isOpen ? 'Open' : 'Closed'}
          </button>
        </div>

        <div className="queue-controls">
          <div className="queue-display">
            <div className="queue-number">{queueData.queueLength}</div>
            <div className="queue-label">People in Queue</div>
          </div>
          
          <div className="queue-buttons">
            <button 
              className="queue-button decrease" 
              onClick={() => updateQueueLength(-1)}
              disabled={queueData.queueLength <= 0}
            >
              -
            </button>
            <button 
              className="queue-button increase" 
              onClick={() => updateQueueLength(1)}
            >
              +
            </button>
          </div>
        </div>

        <div className="wait-time">
          <h4>Estimated Wait Time</h4>
          <div className="time-display">{queueData.estimatedWaitTime} minutes</div>
        </div>

        <div className="last-updated">
          Last updated: {formatTime(queueData.lastUpdated)}
        </div>
      </div>

      <div className="queue-analytics">
        <h3>Queue Analytics</h3>
        <p className="coming-soon">Detailed analytics coming soon!</p>
        <div className="analytics-placeholder">
          <div className="placeholder-chart"></div>
          <p>Queue trends will be displayed here</p>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
