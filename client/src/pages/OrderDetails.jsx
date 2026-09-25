import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import api from '../services/api';
import OrderStatusTracker from '../components/OrderStatusTracker';

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data.order)).catch((err) => setError(err.response?.data?.message || 'Unable to load this order.'));
  }, [id]);

  if (error) return <div className="container page-wrapper"><div className="form-alert error">{error}</div><Link to="/my-orders" className="back-link"><ArrowLeft size={16} /> Back to orders</Link></div>;
  if (!order) return <div className="loading-container"><div className="spinner" /><p>Loading order...</p></div>;

  return <div className="container page-wrapper"><Link to="/my-orders" className="back-link"><ArrowLeft size={16} /> Back to orders</Link><div className="section-heading"><div><span className="eyebrow">Order #{order._id.slice(-8).toUpperCase()}</span><h1>{order.restaurant?.name}</h1></div><span className="badge badge-primary">{order.orderStatus}</span></div><OrderStatusTracker orderStatus={order.orderStatus} timeline={order.statusTimeline} /><div className="dashboard-grid"><section className="card"><h2>Items</h2>{order.items.map((item) => <div className="summary-row" key={item.food}><span>{item.name} x {item.quantity}</span><b>₹{(item.price * item.quantity).toFixed(2)}</b></div>)}</section><section className="card"><h2><MapPin size={18} /> Delivery address</h2><p>{order.deliveryAddress.fullAddress}</p><div className="summary-row"><span>Total</span><strong>₹{order.totalAmount.toFixed(2)}</strong></div></section></div></div>;
};

export default OrderDetails;
