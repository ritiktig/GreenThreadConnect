import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null); // 'seller' or 'buyer'
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError('');
    setFormData({ email: '', password: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Call Express API
      const endpoint = '/api/auth/login';
      const res = await axios.post(endpoint, formData);
      
      const { token, user } = res.data;
      
      // Normalize ID for frontend consistency
      if (user._id && !user.id) {
          user.id = user._id;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'seller') {
        navigate('/seller');
      } else {
        navigate('/buyer');
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
         setError(err.response.data.message);
      } else {
         setError('Login failed. Please try again.');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome to Kala Bazzar</h2>
        
        {!selectedRole ? (
            <>
                <p>Please select your role to continue</p>
                <div className="role-selection">
                  <div className="role-card" onClick={() => handleRoleSelect('seller')}>
                    <h3>I am an Artisan (Seller)</h3>
                    <p>Sell your sustainable products to the world.</p>
                    <button>Login as Seller</button>
                  </div>
                  
                  <div className="role-card" onClick={() => handleRoleSelect('buyer')}>
                    <h3>I am a Buyer</h3>
                    <p>Discover unique, eco-friendly treasures.</p>
                    <button>Login as Buyer</button>
                  </div>
                </div>
            </>
        ) : (
            <div className="login-form-section">
                <h3>Login as {selectedRole === 'seller' ? 'Seller' : 'Buyer'}</h3>
                <button className="back-btn" onClick={() => setSelectedRole(null)}>← Back</button>
                
                {error && <div style={{ color: 'red', margin: '1rem 0', padding: '0.5rem', background: '#ffebee', borderRadius: '4px' }}>
                    {error} <br/>
                    <Link to="/signup" style={{ fontWeight: 'bold' }}>Create an Account</Link>
                </div>}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left', marginTop: '1rem' }}>
                    <label>Email</label>
                    <input name="email" type="email" value={formData.email} onChange={handleChange} required />
                    
                    <label>Password</label>
                    <input name="password" type="password" value={formData.password} onChange={handleChange} required />
                    
                    <button type="submit" style={{ marginTop: '1rem' }}>Login</button>
                </form>
            </div>
        )}

        <p style={{ marginTop: '2rem' }}>
            New to Kala Bazzar? <Link to="/signup">Create an Account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
