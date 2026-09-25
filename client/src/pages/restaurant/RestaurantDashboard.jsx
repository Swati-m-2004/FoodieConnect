import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const RestaurantDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [agents, setAgents] = useState([]);
  const [error, setError] = useState('');
  const load = async () => {
    try {
      const [{ data: orderData }, { data: agentData }] = await Promise.all([api.get('/orders/restaurant/all'), api.get('/delivery/agents')]);
      setOrders(orderData.orders || []); setAgents(agentData.agents || []);
    } catch (err) { setError(err.response?.data?.message || 'Unable to load restaurant operations.'); }
  };
  useEffect(() => { load(); }, []);
  const update = async (id, status, deliveryAgentId) => { await api.put(`/orders/${id}/status`, { status, deliveryAgentId }); load(); };
  return <div className="container page-wrapper"><div className="section-heading"><div><span className="eyebrow">Restaurant operations</span><h1>Order board</h1></div><span className="badge badge-success">{orders.length} orders</span></div>{error && <div className="form-alert error">{error}</div>}<div className="orders-list">{orders.map((order) => <article className="order-card" key={order._id}><div><span className="eyebrow">{new Date(order.createdAt).toLocaleString()}</span><h2>{order.customer?.name || 'Customer'}</h2><p>{order.items.map((item) => `${item.name} x${item.quantity}`).join(', ')}</p><strong>₹{order.totalAmount}</strong></div><div className="order-card-right"><span className="badge badge-primary">{order.orderStatus}</span>{order.orderStatus === 'Pending' && <button className="btn btn-primary" onClick={() => update(order._id, 'Confirmed')}>Accept</button>}{order.orderStatus === 'Confirmed' && <button className="btn btn-primary" onClick={() => update(order._id, 'Preparing')}>Prepare</button>}{order.orderStatus === 'Preparing' && <button className="btn btn-primary" onClick={() => update(order._id, 'Ready for Pickup')}>Ready</button>}{order.orderStatus === 'Ready for Pickup' && agents[0] && <button className="btn btn-primary" onClick={() => update(order._id, 'Assigned to Delivery Agent', agents[0].userId)}>Assign agent</button>}</div></article>)}</div></div>;
};

export default RestaurantDashboard;
