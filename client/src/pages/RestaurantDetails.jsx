import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useLocation } from '../context/LocationContext';
import { useCart } from '../context/CartContext';
import FoodCard from '../components/FoodCard';
import {
  Star,
  Clock,
  Bike,
  MapPin,
  ShieldAlert,
  Search,
  ShoppingBag,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

const RestaurantDetails = () => {
  const { id } = useParams();
  const { selectedLocation } = useLocation();
  const { cartItems, totalCount, totalAmount, restaurant: cartRestaurant } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegFilter, setVegFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestaurantData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [lng, lat] = selectedLocation.coordinates || [];
        const params = lat && lng ? { lat, lng } : {};

        const { data } = await api.get(`/restaurants/${id}`, { params });
        if (data.success) {
          setRestaurant(data.restaurant);
          setFoods(data.foods || []);
          setCategories(data.categories || []);
        }
      } catch (err) {
        console.error('Error loading restaurant:', err);
        setError('Failed to load restaurant menu.');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantData();
  }, [id, selectedLocation]);

  if (loading) {
    return (
      <div className="container page-wrapper">
        <div className="loading-container" style={{ minHeight: '50vh' }}>
          <div className="spinner"></div>
          <p>Loading restaurant menu...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="container page-wrapper">
        <div className="empty-state">
          <div className="empty-state-icon">🍽️</div>
          <h3>{error || 'Restaurant Not Found'}</h3>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '16px' }}>
            <ArrowLeft size={16} /> Back to Restaurants
          </Link>
        </div>
      </div>
    );
  }

  // Filter food items
  const filteredFoods = foods.filter((food) => {
    const matchesCategory = activeCategory === 'All' || food.category === activeCategory;
    const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (food.description && food.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesVeg = !vegFilter || food.isVegetarian;
    return matchesCategory && matchesSearch && matchesVeg;
  });

  return (
    <div className="container page-wrapper" style={{ paddingBottom: totalCount > 0 ? '100px' : '40px' }}>
      {/* Back button */}
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', marginBottom: '16px', fontWeight: 600 }}>
        <ArrowLeft size={16} /> Back to Restaurants
      </Link>

      {/* Restaurant Header Banner Card */}
      <div
        className="card"
        style={{
          padding: '0',
          overflow: 'hidden',
          marginBottom: '32px',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <div style={{ position: 'relative', height: '240px', width: '100%', overflow: 'hidden' }}>
          <img
            src={restaurant.image}
            alt={restaurant.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to top, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.2) 60%)'
            }}
          />

          <div
            style={{
              position: 'absolute',
              bottom: '24px',
              left: '24px',
              right: '24px',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              gap: '16px'
            }}
          >
            <div>
              <h1 style={{ color: 'white', fontSize: '2rem', marginBottom: '6px' }}>
                {restaurant.name}
              </h1>
              <p style={{ color: '#e2e8f0', fontSize: '0.95rem' }}>
                {Array.isArray(restaurant.cuisine) ? restaurant.cuisine.join(' • ') : restaurant.cuisine}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px', fontSize: '0.85rem' }}>
                <span>📍 {restaurant.address}, {restaurant.area}, {restaurant.city}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div
                style={{
                  background: 'white',
                  color: 'var(--text-main)',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Star size={16} fill="#f59e0b" color="#f59e0b" />
                <span>{restaurant.rating || 4.5}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Deliverability & Logistics Bar */}
        <div
          style={{
            padding: '16px 24px',
            backgroundColor: 'var(--bg-main)',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            fontSize: '0.88rem',
            fontWeight: 600
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} color="var(--primary)" />
              <span>{restaurant.estimatedDeliveryTime || '25-35 min'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bike size={16} color="var(--primary)" />
              <span>₹{restaurant.deliveryFee} Delivery Fee</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={16} color="var(--primary)" />
              <span>
                {restaurant.distance !== null
                  ? `${restaurant.distance} km from your location`
                  : `Serves up to ${restaurant.deliveryRadius} km radius`}
              </span>
            </div>
          </div>

          <div>
            {restaurant.isDeliverable ? (
              <span className="badge badge-success" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
                <CheckCircle2 size={14} /> Within Delivery Zone
              </span>
            ) : (
              <span className="badge badge-danger" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
                <ShieldAlert size={14} /> Outside Delivery Radius
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Outside Radius Warning Banner */}
      {!restaurant.isDeliverable && (
        <div
          className="card"
          style={{
            borderColor: 'var(--danger)',
            backgroundColor: 'var(--danger-light)',
            marginBottom: '24px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <ShieldAlert size={24} color="var(--danger)" />
          <div>
            <h4 style={{ color: 'var(--danger)', margin: 0 }}>Outside Service Area</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#7f1d1d' }}>
              This restaurant only delivers up to <strong>{restaurant.deliveryRadius} km</strong>, but your selected address is <strong>{restaurant.distance} km</strong> away. You can view the menu, but checkout requires an address within their delivery zone.
            </p>
          </div>
        </div>
      )}

      {/* Menu Filter & Search Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px'
        }}
      >
        {/* Category Pills */}
        <div className="filter-pills-row" style={{ flex: 1 }}>
          <button
            className={`filter-pill ${activeCategory === 'All' ? 'active' : ''}`}
            onClick={() => setActiveCategory('All')}
          >
            All Items ({foods.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.name}
              className={`filter-pill ${activeCategory === cat.name ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.name)}
            >
              {cat.name} ({cat.items.length})
            </button>
          ))}
        </div>

        {/* Search Dish & Veg Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 700 }}>
            <span className="food-type-icon veg" />
            Veg Only
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={vegFilter}
                onChange={(e) => setVegFilter(e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </label>

          <div style={{ position: 'relative', width: '220px' }}>
            <Search
              size={16}
              color="var(--text-light)"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px', padding: '8px 12px 8px 36px', fontSize: '0.88rem' }}
              placeholder="Search dish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Food Items List */}
      {filteredFoods.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🍲</div>
          <h3>No Dishes Match Your Filter</h3>
          <p>Try searching for a different dish name or reset your filters.</p>
          <button className="btn btn-outline" onClick={() => { setActiveCategory('All'); setSearchQuery(''); setVegFilter(false); }}>
            Reset Filters
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '20px'
          }}
        >
          {filteredFoods.map((food) => (
            <FoodCard key={food._id} food={food} restaurant={restaurant} />
          ))}
        </div>
      )}

      {/* Floating Cart Bar if Items in Cart */}
      {totalCount > 0 && cartRestaurant && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 40px)',
            maxWidth: '680px',
            background: 'var(--text-main)',
            color: 'white',
            padding: '14px 24px',
            borderRadius: 'var(--radius-xl)',
            boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 900,
            animation: 'fadeUp 0.25s ease'
          }}
        >
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800 }}>
              {totalCount} {totalCount === 1 ? 'item' : 'items'} | ₹{totalAmount}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              From {cartRestaurant.name}
            </div>
          </div>

          <Link to="/cart" className="btn btn-primary btn-sm" style={{ padding: '8px 20px' }}>
            <ShoppingBag size={16} /> View Cart & Checkout
          </Link>
        </div>
      )}
    </div>
  );
};

export default RestaurantDetails;
