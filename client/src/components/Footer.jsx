import React from 'react';
import { UtensilsCrossed, MapPin, Heart, Shield, Clock, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Col 1 */}
          <div className="footer-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div className="brand-icon" style={{ width: '36px', height: '36px' }}>
                <UtensilsCrossed size={18} />
              </div>
              <h3 style={{ margin: 0 }}>Foodie<span style={{ color: 'var(--primary)' }}>Connect</span></h3>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#94a3b8', maxWidth: '320px' }}>
              Smart Location-Based Food Delivery application connecting customers strictly with restaurants that serve their geographical delivery radius.
            </p>
          </div>

          {/* Col 2 */}
          <div className="footer-col">
            <h4>Service Cities</h4>
            <ul className="footer-links">
              <li><Link to="/">Gadag (Station Rd, Masari)</Link></li>
              <li><Link to="/">Hubli (Vidyanagar, Gokul Rd)</Link></li>
              <li><Link to="/">Dharwad Central</Link></li>
              <li><Link to="/">Belagavi Service Area</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Browse Restaurants</Link></li>
              <li><Link to="/register">Register Restaurant</Link></li>
              <li><Link to="/register">Join as Delivery Agent</Link></li>
              <li><Link to="/login">Account Login</Link></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="footer-col">
            <h4>Platform Highlights</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} color="var(--primary)" /> Real Geospatial Boundary
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="var(--primary)" /> Fast Order Dispatch
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={16} color="var(--primary)" /> Verified Restaurant Admins
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} FoodieConnect. Built for college project demonstration.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
