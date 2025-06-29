import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import '../styles/SignUp.css';

const SignUp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const roleFromQuery = queryParams.get('role');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: roleFromQuery || 'student',
    // Student-specific fields
    studentId: '',
    faculty: '',
    preferredCanteens: [],
    // Vendor-specific fields
    stallName: '',
    canteenLocation: '',
    stallCategory: '',
    contactNumber: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupError, setSignupError] = useState('');

  // Faculty options for students
  const facultyOptions = [
    'Faculty of Arts & Social Sciences',
    'Faculty of Science',
    'Faculty of Engineering',
    'School of Computing',
    'Business School',
    'School of Design & Environment',
    'Faculty of Law',
    'Yong Loo Lin School of Medicine',
    'Faculty of Dentistry',
    'Other'
  ];

  // Canteen location options for vendors
  const canteenOptions = [
    'The Deck',
    'Frontier',
    'Fine Food',
    'Techno Edge',
    'Science Canteen',
    'Arts Canteen',
    'YIH Foodclusive',
    'UTown Finefood',
    'Medicine Canteen',
    'Business Canteen',
    'Other'
  ];

  // Food category options for vendors
  const categoryOptions = [
    'Chinese',
    'Western',
    'Malay',
    'Indian',
    'Japanese',
    'Korean',
    'Thai',
    'Vegetarian',
    'Beverages',
    'Snacks',
    'Other'
  ];

  useEffect(() => {
    if (roleFromQuery) {
      setFormData(prev => ({ ...prev, role: roleFromQuery }));
    }
  }, [roleFromQuery]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      // Handle preferred canteens multi-select
      if (name === 'preferredCanteens') {
        setFormData(prev => {
          const updatedCanteens = checked 
            ? [...prev.preferredCanteens, value]
            : prev.preferredCanteens.filter(canteen => canteen !== value);
          
          return { ...prev, preferredCanteens: updatedCanteens };
        });
      } else {
        setFormData(prev => ({ ...prev, [name]: checked }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear signup error when any field changes
    if (signupError) {
      setSignupError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Common validations
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }
    
    // Role-specific validations
    if (formData.role === 'student') {
      if (!formData.studentId.trim()) {
        newErrors.studentId = 'Student ID is required';
      }
      
      if (!formData.faculty) {
        newErrors.faculty = 'Please select your faculty';
      }
    } else if (formData.role === 'vendor') {
      if (!formData.stallName.trim()) {
        newErrors.stallName = 'Stall name is required';
      }
      
      if (!formData.canteenLocation) {
        newErrors.canteenLocation = 'Please select your canteen location';
      }
      
      if (!formData.stallCategory) {
        newErrors.stallCategory = 'Please select your stall category';
      }
      
      if (!formData.contactNumber.trim()) {
        newErrors.contactNumber = 'Contact number is required';
      } else if (!/^\d{8}$/.test(formData.contactNumber)) {
        newErrors.contactNumber = 'Please enter a valid 8-digit contact number';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        // Create user with Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          formData.email, 
          formData.password
        );
        
        const user = userCredential.user;
        
        // Create user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          createdAt: new Date(),
          ...(formData.role === 'student' ? {
            studentId: formData.studentId,
            faculty: formData.faculty,
            preferredCanteens: formData.preferredCanteens
          } : {
            stallName: formData.stallName,
            canteenLocation: formData.canteenLocation,
            stallCategory: formData.stallCategory,
            contactNumber: formData.contactNumber
          })
        });
        
        // Redirect based on role
        if (formData.role === 'student') {
          navigate('/student-dashboard');
        } else {
          navigate('/vendor-dashboard');
        }
      } catch (error) {
        console.error('Signup error:', error);
        setSignupError(
          error.code === 'auth/email-already-in-use'
            ? 'This email is already registered. Please use a different email or login.'
            : 'An error occurred during sign up. Please try again.'
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <h1>Create an Account</h1>
          <p>Join NUSmartQueue to manage your dining experience at NUS.</p>
        </div>
        
        {signupError && <div className="error-message">{signupError}</div>}
        
        <form onSubmit={handleSubmit} className="signup-form">
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
          
          {/* Common Fields */}
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={errors.name ? 'error-input' : ''}
            />
            {errors.name && <span className="error">{errors.name}</span>}
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
              placeholder="Create a password"
              className={errors.password ? 'error-input' : ''}
            />
            {errors.password && <span className="error">{errors.password}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className={errors.confirmPassword ? 'error-input' : ''}
            />
            {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
          </div>
          
          {/* Student-specific Fields */}
          {formData.role === 'student' && (
            <>
              <div className="form-group">
                <label htmlFor="studentId">Student ID</label>
                <input
                  type="text"
                  id="studentId"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  placeholder="Enter your student ID"
                  className={errors.studentId ? 'error-input' : ''}
                />
                {errors.studentId && <span className="error">{errors.studentId}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="faculty">Faculty/School</label>
                <select
                  id="faculty"
                  name="faculty"
                  value={formData.faculty}
                  onChange={handleChange}
                  className={errors.faculty ? 'error-input' : ''}
                >
                  <option value="">Select your faculty</option>
                  {facultyOptions.map(faculty => (
                    <option key={faculty} value={faculty}>{faculty}</option>
                  ))}
                </select>
                {errors.faculty && <span className="error">{errors.faculty}</span>}
              </div>
              
              <div className="form-group">
                <label>Preferred Canteens (Optional)</label>
                <div className="checkbox-group">
                  {canteenOptions.map(canteen => (
                    <div key={canteen} className="checkbox-item">
                      <input
                        type="checkbox"
                        id={`canteen-${canteen}`}
                        name="preferredCanteens"
                        value={canteen}
                        checked={formData.preferredCanteens.includes(canteen)}
                        onChange={handleChange}
                      />
                      <label htmlFor={`canteen-${canteen}`}>{canteen}</label>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          
          {/* Vendor-specific Fields */}
          {formData.role === 'vendor' && (
            <>
              <div className="form-group">
                <label htmlFor="stallName">Stall Name</label>
                <input
                  type="text"
                  id="stallName"
                  name="stallName"
                  value={formData.stallName}
                  onChange={handleChange}
                  placeholder="Enter your stall name"
                  className={errors.stallName ? 'error-input' : ''}
                />
                {errors.stallName && <span className="error">{errors.stallName}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="canteenLocation">Canteen Location</label>
                <select
                  id="canteenLocation"
                  name="canteenLocation"
                  value={formData.canteenLocation}
                  onChange={handleChange}
                  className={errors.canteenLocation ? 'error-input' : ''}
                >
                  <option value="">Select your canteen location</option>
                  {canteenOptions.map(canteen => (
                    <option key={canteen} value={canteen}>{canteen}</option>
                  ))}
                </select>
                {errors.canteenLocation && <span className="error">{errors.canteenLocation}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="stallCategory">Stall Category</label>
                <select
                  id="stallCategory"
                  name="stallCategory"
                  value={formData.stallCategory}
                  onChange={handleChange}
                  className={errors.stallCategory ? 'error-input' : ''}
                >
                  <option value="">Select your stall category</option>
                  {categoryOptions.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.stallCategory && <span className="error">{errors.stallCategory}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="contactNumber">Contact Number</label>
                <input
                  type="text"
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder="Enter your contact number"
                  className={errors.contactNumber ? 'error-input' : ''}
                />
                {errors.contactNumber && <span className="error">{errors.contactNumber}</span>}
              </div>
            </>
          )}
          
          <button 
            type="submit" 
            className="signup-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div className="signup-footer">
          <p>
            Already have an account?{' '}
            <Link to={`/login?role=${formData.role}`} className="login-link">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
