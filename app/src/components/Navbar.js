import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';
import './Navbar.css'; 
import logo from '../assets/logo.svg';

function Navbar({ role, cartCount }) {
  const navigate = useNavigate();
  const { currency, changeCurrency } = useCurrency();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/'; 
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token && !!user.name; // Ensure both token and user details exist

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-header">
        <div className="navbar-logo" onClick={() => { navigate('/'); closeMobileMenu(); }}>
          <img src={logo} alt="GreenThreadConnect Logo" className="logo-image" />
          <span className="logo-text">GreenThreadConnect</span>
        </div>
        <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>
      
      <div className={`navbar-content ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="navbar-links">
           {/* Common Public Links */}
          <Link to="/" className="nav-link" onClick={closeMobileMenu}>Home</Link>
          <Link to="/marketplace" className="nav-link" onClick={closeMobileMenu}>Reels</Link>
          <Link to="/marketplace" className="nav-link" onClick={closeMobileMenu}>Marketplace</Link>

          {/* Role Specific */}
          {isLoggedIn && role && role.toLowerCase() === 'buyer' && (
            <>
              <Link to="/buyer/cart" className="nav-link" onClick={closeMobileMenu}>Cart ({cartCount})</Link>
              <Link to="/buyer/history" className="nav-link" onClick={closeMobileMenu}>My Orders</Link>
            </>
          )}
          
          {isLoggedIn && role && (role.toLowerCase() === 'seller' || role.toLowerCase() === 'artisan') && (
             <>
                <Link to="/seller/dashboard" className="nav-link" onClick={closeMobileMenu}>Dashboard</Link>
                <Link to="/seller/add-product" className="nav-link" onClick={closeMobileMenu}>Add Product</Link>
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
                  <Link to="/login" className="nav-link signin-link" onClick={closeMobileMenu}>Sign In</Link>
                  <Link to="/signup" className="btn-signup" onClick={closeMobileMenu}>Create Your Account</Link>
              </div>
          )}
        </div>

        <div className="navbar-currency">
            <select 
                value={currency} 
                onChange={(e) => { changeCurrency(e.target.value); closeMobileMenu(); }}
            >
                <option value="USD">USD ($)</option>
                <option value="INR">INR (₹)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
            </select>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
