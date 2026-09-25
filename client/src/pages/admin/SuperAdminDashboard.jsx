import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null); const [users, setUsers] = useState([]); const [error, setError] = useState('');
  const load = async () => { try { const [{ data: statsData }, { data: usersData }] = await Promise.all([api.get('/admin/stats'), api.get('/admin/users')]); setStats(statsData.stats); setUsers(usersData.users || []); } catch (err) { setError(err.response?.data?.message || 'Unable to load admin data.'); } };
  useEffect(() => { load(); }, []);
  const toggle = async (id) => { await api.put(`/admin/users/${id}/block`); load(); };
  return <div className="container page-wrapper"><div className="section-heading"><div><span className="eyebrow">Platform control</span><h1>Admin overview</h1></div></div>{error && <div className="form-alert error">{error}</div>}<div className="dashboard-grid">{stats && [['Customers', stats.totalCustomers], ['Restaurants', stats.totalRestaurants], ['Agents', stats.totalDeliveryAgents], ['Revenue', `₹${stats.totalRevenue}`]].map(([label, value]) => <div className="card" key={label}><span className="eyebrow">{label}</span><h2>{value}</h2></div>)}</div><section className="card"><div className="card-title-row"><h2>Users</h2><span className="badge badge-primary">{users.length}</span></div><div className="orders-list">{users.map((user) => <div className="order-card" key={user._id}><div><strong>{user.name}</strong><p>{user.email} · {user.role}</p></div>{user.role !== 'superAdmin' && <button className="btn btn-outline" onClick={() => toggle(user._id)}>{user.isBlocked ? 'Unblock' : 'Block'}</button>}</div>)}</div></section></div>;
};

export default SuperAdminDashboard;
