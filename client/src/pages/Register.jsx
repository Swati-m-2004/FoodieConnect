import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';

const Register = () => {
  const { register } = useAuth();
  const { selectedLocation } = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', house: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    setBusy(true); setError('');
    try {
      await register({ ...form, role: 'customer', area: selectedLocation.area, city: selectedLocation.city, pincode: selectedLocation.pincode, state: 'Karnataka', coordinates: selectedLocation.coordinates });
      navigate('/');
    } catch (err) { setError(err.response?.data?.message || 'Unable to create your account.'); } finally { setBusy(false); }
  };

  return <div className="auth-wrapper"><div className="auth-card auth-card-wide">
    <div className="auth-header"><div className="auth-mark"><UserPlus size={22} /></div><h2>Join FoodieConnect</h2><p>We will use your delivery area to show restaurants that really serve you.</p></div>
    {error && <div className="form-alert error">{error}</div>}
    <form onSubmit={submit}>
      <div className="form-row"><label className="form-group"><span className="form-label">Full name</span><input className="form-input" name="name" required value={form.name} onChange={change} placeholder="Your name" /></label><label className="form-group"><span className="form-label">Phone number</span><input className="form-input" name="phone" required value={form.phone} onChange={change} placeholder="10 digit number" /></label></div>
      <label className="form-group"><span className="form-label">Email address</span><input className="form-input" type="email" name="email" required value={form.email} onChange={change} placeholder="you@example.com" /></label>
      <div className="form-row"><label className="form-group"><span className="form-label">Password</span><input className="form-input" type="password" name="password" required minLength="6" value={form.password} onChange={change} placeholder="At least 6 characters" /></label><label className="form-group"><span className="form-label">Confirm password</span><input className="form-input" type="password" name="confirmPassword" required value={form.confirmPassword} onChange={change} placeholder="Repeat password" /></label></div>
      <div className="location-preview"><MapPin size={18} /><div><strong>Starting delivery location</strong><span>{selectedLocation.fullAddress}</span></div></div>
      <label className="form-group"><span className="form-label">House / building <small>(optional)</small></span><input className="form-input" name="house" value={form.house} onChange={change} placeholder="Flat, house or landmark" /></label>
      <button className="btn btn-primary btn-full btn-lg" disabled={busy}>{busy ? 'Creating account...' : 'Create customer account'} <ArrowRight size={17} /></button>
    </form>
    <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
  </div></div>;
};

export default Register;