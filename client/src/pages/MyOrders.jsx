import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Clock3, PackageCheck } from 'lucide-react';
import api from '../services/api';

const MyOrders = () => {
  const [orders, setOrders] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [params] = useSearchParams();
  useEffect(() => { api.get('/orders/my-orders').then(({ data }) => setOrders(data.orders || [])).catch(() => setError('Unable to load your orders.')).finally(() => setLoading(false)); }, []);
  return <div className="container page-wrapper"><div className="section-heading"><div><span className="eyebrow">Your FoodieConnect activity</span><h1>My orders</h1></div><Link to="/" className="btn btn-outline">Order something good <ArrowRight size={16} /></Link></div>{params.get('placed') && <div className="form-alert success"><PackageCheck size={18} /> Order placed. The restaurant has received it.</div>}{loading ? <div className="loading-container"><div className="spinner" /><p>Loading your orders...</p></div> : error ? <div className="form-alert error">{error}</div> : !orders.length ? <div className="empty-state"><div className="empty-state-icon"><Clock3 size={46} /></div><h3>No orders yet</h3><p>Your first order is going to taste even better.</p><Link to="/" className="btn btn-primary">Browse restaurants</Link></div> : <div className="orders-list">{orders.map((order) => <Link className="order-card" to={`/orders/${order._id}`} key={order._id}><div><span className="eyebrow">{new Date(order.createdAt).toLocaleDateString()}</span><h2>{order.restaurant?.name || 'Restaurant'}</h2><p>{order.items?.length || 0} items · ₹{order.totalAmount}</p></div><div className="order-card-right"><span className={`badge ${order.orderStatus === 'Delivered' ? 'badge-success' : order.orderStatus === 'Cancelled' ? 'badge-danger' : 'badge-primary'}`}>{order.orderStatus}</span><ArrowRight size={17} /></div></Link>)}</div>}</div>;
};

export default MyOrders;