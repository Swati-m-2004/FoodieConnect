import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { useCart } from '../context/CartContext';
import {
  MapPin,
  ShoppingBag,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  UtensilsCrossed,
  ShieldCheck,
  Truck,
  Layers
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { selectedLocation, openLocationModal } = useLocation();
  const { totalCount } = useCart();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    if (user.role === 'restaurantAdmin') return '/restaurant/dashboard';
    if (user.role === 'deliveryAgent') return '/delivery/dashboard';
    if (user.role === 'superAdmin') return '/admin/dashboard';
    return '/my-orders';
  };

  return (
    <header className="navbar">
      <div className="container nav-container">
        {/* Brand */}
        <Link to="/" className="nav-brand">
          <div className="brand-icon">
            <UtensilsCrossed size={22} />
          </div>
          <span>Foodie<span className="brand-accent">Connect</span></span>
        </Link>

        {/* Location Selector Pill */}
        <div className="location-pill" onClick={openLocationModal} title="Click to change your delivery location">
          <MapPin size={20} className="loc-pin-icon" />
          <div className="loc-text-wrap">
            <span className="loc-label">Delivering to</span>
            <span className="loc-val">
              {selectedLocation.area}, {selectedLocation.city}
            </span>
          </div>
          <span className="loc-change-btn">Change</span>
        </div>

        {/* Right Actions */}
        <div className="nav-actions">
          {/* Cart button */}
          <Link to="/cart" className="cart-button">
            <ShoppingBag size={18} color="var(--primary)" />
            <span>Cart</span>
            {totalCount > 0 && <span className="cart-badge">{totalCount}</span>}
          </Link>

          {/* User Auth or Dropdown */}
          {isAuthenticated ? (
            <div className="user-menu-wrap">
              <button
                className="user-profile-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="user-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span>{user.name.split(' ')[0]}</span>
                <span className="role-badge-nav">{user.role}</span>
                <ChevronDown size={14} />
              </button>

              {dropdownOpen && (
                <div className="dropdown-menu" onClick={() => setDropdownOpen(false)}>
                  <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{user.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                  </div>

                  {user.role === 'customer' && (
                    <>
                      <Link to="/my-orders" className="dropdown-item">
                        <ShoppingBag size={16} /> My Orders
                      </Link>
                      <Link to="/profile" className="dropdown-item">
                        <User size={16} /> Saved Addresses
                      </Link>
                    </>
                  )}

                  {user.role === 'restaurantAdmin' && (
                    <>
                      <Link to="/restaurant/dashboard" className="dropdown-item">
                        <Layers size={16} /> Restaurant Dashboard
                      </Link>
                      <Link to="/restaurant/orders" className="dropdown-item">
                        <ShoppingBag size={16} /> Incoming Orders
                      </Link>
                      <Link to="/restaurant/menu" className="dropdown-item">
                        <UtensilsCrossed size={16} /> Menu Management
                      </Link>
                      <Link to="/restaurant/profile" className="dropdown-item">
                        <MapPin size={16} /> Location & Radius
                      </Link>
                    </>
                  )}

                  {user.role === 'deliveryAgent' && (
                    <Link to="/delivery/dashboard" className="dropdown-item">
                      <Truck size={16} /> Delivery Dashboard
                    </Link>
                  )}

                  {user.role === 'superAdmin' && (
                    <Link to="/admin/dashboard" className="dropdown-item">
                      <ShieldCheck size={16} /> Super Admin Panel
                    </Link>
                  )}

                  <div className="dropdown-divider"></div>
                  <div className="dropdown-item" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
                    <LogOut size={16} /> Sign Out
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link to="/login" className="btn btn-outline btn-sm btn-login-header">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm btn-login-header">
                Register
              </Link>
            </div>
          )}

          {/* Mobile hamburger toggle */}
          <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <div className="mobile-drawer-content">
            {/* Mobile location bar */}
            <div
              className="location-pill"
              style={{ display: 'flex', width: '100%', maxWidth: 'none' }}
              onClick={() => {
                setMobileMenuOpen(false);
                openLocationModal();
              }}
            >
              <MapPin size={20} className="loc-pin-icon" />
              <div className="loc-text-wrap" style={{ flex: 1 }}>
                <span className="loc-label">Delivering to</span>
                <span className="loc-val">
                  {selectedLocation.area}, {selectedLocation.city}
                </span>
              </div>
              <span className="loc-change-btn">Change</span>
            </div>

            <Link
              to="/"
              className="btn btn-secondary btn-full"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Restaurants
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardPath()}
                  className="btn btn-primary btn-full"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard ({user.role})
                </Link>
                {user.role === 'customer' && (
                  <Link
                    to="/my-orders"
                    className="btn btn-outline btn-full"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                )}
                <button
                  className="btn btn-danger btn-full"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link
                  to="/login"
                  className="btn btn-outline btn-full"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary btn-full"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
