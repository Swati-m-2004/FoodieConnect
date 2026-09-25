import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, LockKeyhole, Mail, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await login(form.email, form.password);
      const destination = location.state?.from?.pathname || (user.role === 'customer' ? '/' : `/${user.role === 'restaurantAdmin' ? 'restaurant' : user.role === 'deliveryAgent' ? 'delivery' : 'admin'}/dashboard`);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to sign in. Check your details and try again.');
    } finally {
      setBusy(false);
    }
  };

  return <div className="auth-wrapper"><div className="auth-card">
    <div className="auth-header"><div className="auth-mark"><UtensilsCrossed size={22} /></div><h2>Welcome back</h2><p>Your next good meal is only a few taps away.</p></div>
    {error && <div className="form-alert error">{error}</div>}
    <form onSubmit={submit}>
      <label className="form-group"><span className="form-label">Email address</span><span className="input-with-icon"><Mail size={17} /><input className="form-input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></span></label>
      <label className="form-group"><span className="form-label">Password</span><span className="input-with-icon"><LockKeyhole size={17} /><input className="form-input" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Enter your password" /></span></label>
      <button className="btn btn-primary btn-full btn-lg" disabled={busy}>{busy ? 'Signing in...' : 'Sign in'} <ArrowRight size={17} /></button>
    </form>
    <p className="auth-switch">New to FoodieConnect? <Link to="/register">Create an account</Link></p>
  </div></div>;
};

export default Login;