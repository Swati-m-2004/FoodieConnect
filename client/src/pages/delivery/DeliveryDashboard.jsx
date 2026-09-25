import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const DeliveryDashboard = () => {
  const [orders, setOrders] = useState([]); const [error, setError] = useState('');
  const load = () => api.get('/delivery/orders').then(({ data }) => setOrders(data.orders || [])).catch((err) => setError(err.response?.data?.message || 'Unable to load assigned deliveries.'));
  useEffect(() => { load(); }, []);
  const advance = async (order) => { const next = order.orderStatus === 'Assigned to Delivery Agent' ? 'Picked Up' : order.orderStatus === 'Picked Up' ? 'Out for Delivery' : 'Delivered'; await api.put(`/delivery/orders/${order._id}/status`, { status: next }); load(); };
  return <div className="container page-wrapper"><div className="section-heading"><div><span className="eyebrow">Delivery console</span><h1>Assigned deliveries</h1></div><span className="badge badge-success">{orders.length} active</span></div>{error && <div className="form-alert error">{error}</div>}<div className="orders-list">{orders.map((order) => <article className="order-card" key={order._id}><div><span className="eyebrow">{order.restaurant?.name}</span><h2>{order.customer?.name}</h2><p>{order.deliveryAddress?.fullAddress}</p><strong>{order.orderStatus}</strong></div><button className="btn btn-primary" onClick={() => advance(order)}>{order.orderStatus === 'Assigned to Delivery Agent' ? 'Pick up' : order.orderStatus === 'Picked Up' ? 'Start delivery' : 'Mark delivered'}</button></article>)}</div></div>;
};

export default DeliveryDashboard;
