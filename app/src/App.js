import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import SellerDashboard from './components/SellerDashboard';
import SellerMarketplace from './components/SellerMarketplace';
import AddProduct from './components/AddProduct';
import EditProduct from './components/EditProduct';
import BuyerStorefront from './components/BuyerStorefront';
import Login from './components/Login';
import Signup from './components/Signup';
import PricePrediction from './components/PricePrediction';
import SellerAnalytics from './components/SellerAnalytics';
import MyProducts from './components/MyProducts';
import AIBot from './components/AIBot';
import './App.css';
import { CurrencyProvider } from './context/CurrencyContext';

import Cart from './components/Cart';
import BuyerHistory from './components/BuyerHistory';

import Checkout from './components/Checkout';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Decide where to show Navbar. 
  // We want it on Home, Marketplace, Seller Dashboards etc.
  // Maybe not on dedicated auth pages like /login? 
  // User wanted "signup and signin option should be present in the nav bar".
  // This implies the navbar is visible when you are NOT logged in (e.g. on Home).
  // If we go to /login, we can hide it to avoid clutter, or keep it.
  // Let's keep it visible everywhere for consistency unless it looks bad.
  // Actually, standard practice for simple login pages is to have them clean.
  // But our previous implementation hid it on / and /signup.
  // Let's hide it ONLY on /login and /signup, but show on / (Home).
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  
  const [cart, setCart] = React.useState([]);
  // eslint-disable-next-line no-unused-vars
  const [history, setHistory] = React.useState([]);

  const addToCart = (product) => {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.email || user.role !== 'buyer') {
        alert("Please sign in as a buyer to add items to your cart.");
        navigate('/login');
        return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item._id === product._id);
      if (existingItem) {
        return prevCart.map(item => 
          item._id === product._id ? { ...item, quantity: (item.quantity || 1) + 1 } : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
    alert(`${product.name} added to cart!`);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    navigate('/buyer/checkout'); 
  };

  let role = null;
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.role) role = user.role.toLowerCase();
  
  // Url fallback (if needed)
  if (!role && location.pathname.includes('/seller')) role = 'seller';
  if (!role && location.pathname.includes('/buyer')) role = 'buyer';

  return (
    <div className="App">
      <Navbar role={role} cartCount={cart.length} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Public/Buyer Routes */}
        <Route path="/marketplace" element={<BuyerStorefront addToCart={addToCart} />} />
        <Route path="/buyer" element={<BuyerStorefront addToCart={addToCart} />} /> {/* Keep for backward compat */}
        
        <Route path="/buyer/cart" element={<Cart cart={cart} setCart={setCart} onCheckout={handleCheckout} />} />
        <Route path="/buyer/checkout" element={<Checkout cart={cart} setCart={setCart} />} />
        <Route path="/buyer/history" element={<BuyerHistory history={history} />} />

        {/* Seller Routes */}
        <Route path="/seller" element={<SellerMarketplace addToCart={addToCart} />} />
        <Route path="/seller/dashboard" element={<SellerDashboard />} />
        <Route path="/seller/add-product" element={<AddProduct />} />
        <Route path="/seller/edit-product/:id" element={<EditProduct />} />
        <Route path="/seller/predictions" element={<PricePrediction />} />
      </Routes>
      <AIBot />
    </div>
  );
}

function App() {
  return (
    <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <CurrencyProvider>
        <AppContent />
      </CurrencyProvider>
    </Router>
  );
}

export default App;
