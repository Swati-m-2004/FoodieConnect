import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, MapPin, Bike } from 'lucide-react';

const RestaurantCard = ({ restaurant }) => {
  const {
    _id,
    name,
    cuisine = [],
    image,
    rating = 4.5,
    estimatedDeliveryTime = '25-35 min',
    distance,
    deliveryFee = 30,
    isOpen = true,
    area,
    city
  } = restaurant;

  const cuisinesText = Array.isArray(cuisine) ? cuisine.join(' • ') : cuisine;

  return (
    <Link to={`/restaurant/${_id}`} className="restaurant-card">
      {/* Image Container */}
      <div className="rest-img-wrapper">
        <img src={image} alt={name} className="rest-img" loading="lazy" />

        {/* Distance Badge */}
        {distance !== undefined && distance !== null && (
          <div className="rest-badge-distance">
            <MapPin size={13} color="#ff8a65" />
            <span>{distance} km away</span>
          </div>
        )}

        {/* Rating Badge */}
        <div className="rest-badge-rating">
          <Star size={13} fill="currentColor" />
          <span>{rating}</span>
        </div>

        {/* Open/Closed Tag */}
        <div className={`rest-status-tag ${isOpen ? 'rest-status-open' : 'rest-status-closed'}`}>
          {isOpen ? 'Open Now' : 'Closed'}
        </div>
      </div>

      {/* Card Content */}
      <div className="rest-card-body">
        <h3 className="rest-name">{name}</h3>
        <p className="rest-cuisines" title={cuisinesText}>
          {cuisinesText}
        </p>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
          📍 {area}, {city}
        </div>

        {/* Meta Info */}
        <div className="rest-meta">
          <div className="rest-meta-item">
            <Clock size={14} color="var(--primary)" />
            <span>{estimatedDeliveryTime}</span>
          </div>
          <div className="rest-meta-item">
            <Bike size={14} color="var(--primary)" />
            <span>₹{deliveryFee} delivery</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
