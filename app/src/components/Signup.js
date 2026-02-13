import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Signup.css';

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Buyer' 
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role) => {
      setFormData({ ...formData, role: role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = '/api/auth/register';
      const dataToSend = {
          ...formData,
          role: formData.role.toLowerCase() === 'artisan' ? 'seller' : 'buyer',
           // Basic fallback region if backend requires it. 
           // Mock-up didn't show region, so we'll default or handle if needed.
          region: 'India' 
      };
      
      await axios.post(endpoint, dataToSend);
      // Redirect to login page
      navigate('/login');
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
          setError(err.response.data.message);
      } else {
          setError('Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        {/* Logo Placeholder */}
        <div className="signup-logo">
            <span className="logo-initials">KM</span>
        </div>

        <h2>Create Your Account</h2>
        <p className="signup-subtitle">Choose your role and start your journey</p>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="signup-form">
            <div className="form-group">
                <label>Full Name</label>
                <input 
                    name="name" 
                    placeholder="Enter your full name" 
                    value={formData.name}
                    onChange={handleChange} 
                    required 
                />
            </div>
            
            <div className="form-group">
                <label>Email Address</label>
                <input 
                    name="email" 
                    type="email" 
                    placeholder="Enter your email" 
                    value={formData.email}
                    onChange={handleChange} 
                    required 
                />
            </div>
            
            <div className="form-group">
                <label>Password</label>
                <div className="password-input-wrapper">
                    <input 
                        name="password" 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Password" 
                        value={formData.password}
                        onChange={handleChange} 
                        required 
                    />
                     <span 
                        className="toggle-password"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                    </span>
                </div>
            </div>
            
            <div className="role-selection-group">
                <label>Choose Your Role</label>
                <div className="role-options">
                    <div 
                        className={`role-option ${formData.role === 'Buyer' ? 'active' : ''}`}
                        onClick={() => handleRoleSelect('Buyer')}
                    >
                        <div className="role-icon">🛍️</div>
                        <h4>Buyer</h4>
                        <p>Shop for unique art</p>
                    </div>

                    <div 
                        className={`role-option ${formData.role === 'Artisan' ? 'active' : ''}`}
                        onClick={() => handleRoleSelect('Artisan')}
                    >
                        <div className="role-icon">🎨</div>
                        <h4>Artisan</h4>
                        <p>Sell your creations</p>
                    </div>
                </div>
            </div>
            
            <button type="submit" className="btn-signup-submit">Create Account &rarr;</button>
        </form>
        
        <div className="signup-footer">
            <p>Or continue with</p>
            {/* Social Icons Placeholder */}
             <div className="social-icons">
                 <button className="social-btn">G</button>
                 <button className="social-btn">f</button>
             </div>
             <p className="login-redirect">Already have an account? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
