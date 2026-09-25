import React from 'react';
import { useCart } from '../context/CartContext';
import { Plus, Minus } from 'lucide-react';

const FoodCard = ({ food, restaurant }) => {
  const { cartItems, addToCart, updateQuantity } = useCart();

  const cartItem = cartItems.find((item) => item.foodId === food._id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleAdd = () => {
    if (!food.isAvailable) return;
    addToCart(food, restaurant);
  };

  return (
    <div className="food-card">
      {/* Left Info */}
      <div className="food-info">
        <div className="food-header-row">
          <span className={`food-type-icon ${food.isVegetarian ? 'veg' : 'non-veg'}`} title={food.isVegetarian ? 'Vegetarian' : 'Non-Vegetarian'} />
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: food.isVegetarian ? 'var(--veg-green)' : 'var(--nonveg-red)' }}>
            {food.isVegetarian ? 'VEG' : 'NON-VEG'}
          </span>
        </div>

        <h4 className="food-name">{food.name}</h4>
        <div className="food-price">₹{food.price}</div>
        {food.description && <p className="food-desc">{food.description}</p>}

        {!food.isAvailable && (
          <span className="badge badge-danger" style={{ marginTop: '6px' }}>
            Out of Stock
          </span>
        )}
      </div>

      {/* Right Image & Add Button */}
      <div className="food-action-side">
        <img
          src={food.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=60'}
          alt={food.name}
          className="food-thumbnail"
          loading="lazy"
        />

        <div className="food-add-btn-wrap">
          {!food.isAvailable ? (
            <button className="btn btn-secondary btn-sm" disabled style={{ opacity: 0.5 }}>
              Sold Out
            </button>
          ) : quantity > 0 ? (
            <div className="quantity-stepper">
              <button
                className="stepper-btn"
                onClick={() => updateQuantity(food._id, -1)}
                title="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span className="stepper-qty">{quantity}</span>
              <button
                className="stepper-btn"
                onClick={() => updateQuantity(food._id, 1)}
                title="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <button
              className="btn btn-outline btn-sm"
              style={{
                backgroundColor: 'white',
                color: 'var(--primary)',
                borderColor: 'var(--primary)',
                boxShadow: 'var(--shadow-xs)'
              }}
              onClick={handleAdd}
            >
              ADD <Plus size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
