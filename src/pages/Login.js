import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import '../styles/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const roleFromQuery = queryParams.get('role');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: roleFromQuery || 'student',
    rememberMe: false
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    if (roleFromQuery) {
      setFormData(prev => ({ ...prev, role: roleFromQuery }));
    }
  }, [roleFromQuery]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear login error when any field changes
    if (loginError) {
      setLoginError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        // Sign in with Firebase Authentication
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        
        // In a real app, you would check the user's role in Firestore here
        // and redirect accordingly
        
        // For now, we'll just redirect based on the selected role
        if (formData.role === 'student') {
          navigate('/student-dashboard');
        } else {
          navigate('/vendor-dashboard');
        }
      } catch (error) {
        console.error('Login error:', error);
        setLoginError(
          error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password'
            ? 'Invalid email or password'
            : 'An error occurred during login. Please try again.'
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Login to NUSmartQueue</h1>
          <p>Welcome back! Please login to your account.</p>
        </div>
        
        {loginError && <div className="error-message">{loginError}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="role">I am a:</label>
            <div className="role-toggle">
              <button
                type="button"
                className={`role-option ${formData.role === 'student' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, role: 'student' }))}
              >
                Student
              </button>
              <button
                type="button"
                className={`role-option ${formData.role === 'vendor' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, role: 'vendor' }))}
              >
                Vendor
              </button>
            </div>
            {errors.role && <span className="error">{errors.role}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={errors.email ? 'error-input' : ''}
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={errors.password ? 'error-input' : ''}
            />
            {errors.password && <span className="error">{errors.password}</span>}
          </div>
          
          <div className="form-options">
            <div className="remember-me">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <label htmlFor="rememberMe">Remember me</label>
            </div>
            <Link to="/forgot-password" className="forgot-password">
              Forgot Password?
            </Link>
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="login-footer">
          <p>
            Don't have an account?{' '}
            <Link to={`/signup?role=${formData.role}`} className="signup-link">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
