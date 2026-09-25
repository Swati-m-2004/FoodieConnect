import React, { useState, useEffect } from 'react';
import { useLocation } from '../context/LocationContext';
import RestaurantCard from '../components/RestaurantCard';
import api from '../services/api';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Utensils,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  RotateCcw
} from 'lucide-react';

const CUISINES = [
  'All',
  'North Indian',
  'South Indian',
  'Biryani',
  'Rolls',
  'Chinese',
  'Pizza',
  'Fast Food',
  'Desserts'
];

const Home = () => {
  const { selectedLocation, openLocationModal } = useLocation();

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [sortBy, setSortBy] = useState('distance'); // distance | rating | deliveryFee

  // Fetch nearby serviceable restaurants whenever location or filters change
  useEffect(() => {
    const fetchRestaurants = async () => {
      if (!selectedLocation.coordinates) return;

      setLoading(true);
      setError(null);

      try {
        const [lng, lat] = selectedLocation.coordinates;
        const params = {
          lat,
          lng,
          cuisine: selectedCuisine,
          search: searchQuery,
          vegOnly: vegOnly ? 'true' : 'false',
          sortBy
        };

        const { data } = await api.get('/restaurants/nearby', { params });
        if (data.success) {
          setRestaurants(data.restaurants || []);
        }
      } catch (err) {
        console.error('Error fetching nearby restaurants:', err);
        setError('Unable to load restaurants for this location.');
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchRestaurants, 250);
    return () => clearTimeout(timer);
  }, [selectedLocation, selectedCuisine, searchQuery, vegOnly, sortBy]);

  return (
    <div className="container page-wrapper">
      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="hero-content">
          <div className="hero-tag">
            <Sparkles size={14} /> Location-Aware Food Ordering
          </div>
          <h1 className="hero-title">
            Hungry in {selectedLocation.area || selectedLocation.city}? We’ve got you covered.
          </h1>
          <p className="hero-subtitle">
            Only restaurants that actually deliver to your geographical location are displayed. No false promises, no cancelled deliveries.
          </p>

          {/* Quick Location Bar in Hero */}
          <div className="hero-location-bar">
            <MapPin size={22} color="var(--primary)" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 800 }}>
                Selected Delivery Address
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {selectedLocation.fullAddress || `${selectedLocation.area}, ${selectedLocation.city}`}
              </div>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={openLocationModal}
              style={{ flexShrink: 0 }}
            >
              Change Location
            </button>
          </div>
        </div>
      </section>

      {/* Cuisine Quick-Select Pills */}
      <section style={{ marginBottom: '28px' }}>
        <div className="filter-pills-row">
          {CUISINES.map((cuisine) => (
            <button
              key={cuisine}
              className={`filter-pill ${selectedCuisine === cuisine ? 'active' : ''}`}
              onClick={() => setSelectedCuisine(cuisine)}
            >
              {cuisine}
            </button>
          ))}
        </div>
      </section>

      {/* Filter and Search Toolbar */}
      <section
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px',
          background: 'white',
          padding: '16px 20px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)'
        }}
      >
        {/* Search Bar */}
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
          <Search
            size={18}
            color="var(--text-light)"
            style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '40px' }}
            placeholder="Search restaurants or cuisines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {/* Veg-only toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 700 }}>
            <span className={`food-type-icon veg`} />
            Pure Veg
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={vegOnly}
                onChange={(e) => setVegOnly(e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </label>

          {/* Sort By Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SlidersHorizontal size={16} color="var(--text-muted)" />
            <select
              className="form-select"
              style={{ width: 'auto', padding: '8px 14px', fontSize: '0.88rem' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="distance">Nearest First</option>
              <option value="rating">Top Rated</option>
              <option value="deliveryFee">Lowest Delivery Fee</option>
            </select>
          </div>
        </div>
      </section>

      {/* Main Restaurant Listing */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>
              Serviceable Restaurants
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Showing places delivering to <strong>{selectedLocation.area}, {selectedLocation.city}</strong>
            </p>
          </div>
          <span className="badge badge-primary">
            {restaurants.length} {restaurants.length === 1 ? 'Restaurant' : 'Restaurants'} Found
          </span>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Scanning radius for active restaurants...</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <div className="empty-state-icon">⚠️</div>
            <h3>{error}</h3>
            <button className="btn btn-outline" onClick={() => window.location.reload()}>
              <RotateCcw size={16} /> Retry
            </button>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🛵</div>
            <h3>No Restaurants Deliver Here Yet</h3>
            <p>
              We couldn’t find any active restaurants with a delivery radius covering <strong>{selectedLocation.area}, {selectedLocation.city}</strong>.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={openLocationModal}>
                <MapPin size={16} /> Select Another Location
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '24px'
            }}
          >
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant._id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </section>

      {/* Informational Feature Section */}
      <section style={{ marginTop: '70px', borderTop: '1px solid var(--border)', paddingTop: '40px' }}>
        <h3 style={{ textAlign: 'center', fontSize: '1.4rem', marginBottom: '32px' }}>
          Why FoodieConnect's Location Matching Matters
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px'
          }}
        >
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <MapPin size={24} />
            </div>
            <h4>Geographical Precision</h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Uses exact map coordinates and MongoDB 2dsphere indexing to calculate physical delivery distances.
            </p>
          </div>

          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <Zap size={24} />
            </div>
            <h4>Direct Order Routing</h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Your order goes instantly to the matching restaurant admin’s dashboard for immediate kitchen preparation.
            </p>
          </div>

          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--info-light)', color: 'var(--info)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <ShieldCheck size={24} />
            </div>
            <h4>Strict Area Protection</h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Prevents ordering from restaurants outside the delivery radius, eliminating cold food and dispatch failures.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
