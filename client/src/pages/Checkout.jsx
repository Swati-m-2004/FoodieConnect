import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, MapPin, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLocation } from '../context/LocationContext';
import api from '../services/api';

const Checkout = () => {
  const { selectedLocation } = useLocation();
  const { cartItems, restaurant, subtotal, deliveryFee, tax, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [label, setLabel] = useState('Home');
  const placeOrder = async () => {
    setPlacing(true); setError('');
    try {
      const { data } = await api.post('/orders', { restaurantId: restaurant._id, items: cartItems.map((item) => ({ foodId: item.foodId, quantity: item.quantity })), deliveryAddress: { label, house: selectedLocation.house || '', area: selectedLocation.area, city: selectedLocation.city, state: selectedLocation.state || 'Karnataka', pincode: selectedLocation.pincode, fullAddress: selectedLocation.fullAddress }, deliveryLocation: { type: 'Point', coordinates: selectedLocation.coordinates }, paymentMethod: 'COD' });
      clearCart(); navigate(`/my-orders?placed=${data.order._id}`);
    } catch (err) { setError(err.response?.data?.message || 'We could not place this order. Please try again.'); } finally { setPlacing(false); }
  };
  if (!cartItems.length || !restaurant) return <div className="container page-wrapper"><div className="empty-state"><h3>Your cart is empty</h3><Link to="/" className="btn btn-primary">Find food</Link></div></div>;
  return <div className="container page-wrapper"><Link to="/cart" className="back-link"><ArrowLeft size={16} /> Back to cart</Link><div className="section-heading"><div><span className="eyebrow">Final step</span><h1>Confirm your delivery</h1></div><span className="secure-note"><ShieldCheck size={16} /> Secure checkout</span></div><div className="checkout-layout"><section className="checkout-main">{error && <div className="form-alert error">{error}</div>}<div className="card checkout-address"><div className="card-title-row"><h2><MapPin size={19} /> Deliver to</h2><Link to="/profile">Manage addresses</Link></div><div className="selected-address"><strong>{label}</strong><span>{selectedLocation.fullAddress}</span></div><div className="address-labels"><button className={label === 'Home' ? 'active' : ''} onClick={() => setLabel('Home')}>Home</button><button className={label === 'Office' ? 'active' : ''} onClick={() => setLabel('Office')}>Office</button><button className={label === 'Other' ? 'active' : ''} onClick={() => setLabel('Other')}>Other</button></div></div><div className="card payment-card"><div className="card-title-row"><h2>Payment method</h2><span className="badge badge-success">Available</span></div><div className="payment-option"><span className="radio-dot active" /><div><strong>Cash on Delivery</strong><small>Pay when your food arrives</small></div><CheckCircle2 size={18} color="var(--success)" /></div></div></section><aside className="summary-card"><div className="summary-heading"><h2>{restaurant.name}</h2><span>COD</span></div><div className="summary-row"><span>Subtotal</span><b>₹{subtotal.toFixed(2)}</b></div><div className="summary-row"><span>Delivery</span><b>₹{deliveryFee.toFixed(2)}</b></div><div className="summary-row"><span>GST</span><b>₹{tax.toFixed(2)}</b></div><div className="summary-total"><span>Total</span><strong>₹{totalAmount.toFixed(2)}</strong></div><button className="btn btn-primary btn-full btn-lg" onClick={placeOrder} disabled={placing}>{placing ? 'Placing order...' : `Place order · ₹${totalAmount.toFixed(2)}`}</button><p className="summary-note">The restaurant will confirm your order shortly.</p></aside></div></div>;
};

export default Checkout;