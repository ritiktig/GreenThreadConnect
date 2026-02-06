import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css'; // We'll create this CSS file next

function Navbar({ role, cartCount }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/'; 
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token && !!user.name; // Ensure both token and user details exist

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => navigate('/')}>
        <span className="logo-icon">🎨</span> Kala Bazzar
      </div>
      
      <div className="navbar-links">
         {/* Common Public Links */}
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/marketplace" className="nav-link">Reels</Link>
        <Link to="/marketplace" className="nav-link">Marketplace</Link>
        <Link to="/marketplace" className="nav-link">Auctions</Link>

        {/* Role Specific */}
        {isLoggedIn && role && role.toLowerCase() === 'buyer' && (
          <>
            <Link to="/buyer/cart" className="nav-link">Cart ({cartCount})</Link>
            <Link to="/buyer/history" className="nav-link">My Orders</Link>
          </>
        )}
        
        {isLoggedIn && role && (role.toLowerCase() === 'seller' || role.toLowerCase() === 'artisan') && (
           <>
              <Link to="/seller/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/seller/add-product" className="nav-link">Add Product</Link>
           </>
        )}
      </div>

      <div className="navbar-auth">
        {isLoggedIn ? (
             <div className="user-menu">
                <span className="user-greeting">Hello, {user.name}</span>
                <button onClick={handleLogout} className="btn-logout">Logout</button>
             </div>
        ) : (
            <div className="auth-buttons">
                <Link to="/login" className="nav-link signin-link">Sign In</Link>
                <Link to="/signup" className="btn-signup">Create Your Account</Link>
            </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
