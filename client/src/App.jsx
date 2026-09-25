import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LocationModal from './components/LocationModal';
import CartConflictModal from './components/CartConflictModal';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import RestaurantDetails from './pages/RestaurantDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import Profile from './pages/Profile';
import OrderDetails from './pages/OrderDetails';
import RestaurantDashboard from './pages/restaurant/RestaurantDashboard';
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';
import SuperAdminDashboard from './pages/admin/SuperAdminDashboard';

const App = () => (
  <AuthProvider>
    <LocationProvider>
      <CartProvider>
        <Navbar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/restaurant/:id" element={<RestaurantDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<ProtectedRoute allowedRoles={['customer']}><Checkout /></ProtectedRoute>} />
            <Route path="/my-orders" element={<ProtectedRoute allowedRoles={['customer']}><MyOrders /></ProtectedRoute>} />
            <Route path="/orders/:id" element={<ProtectedRoute allowedRoles={['customer', 'restaurantAdmin', 'deliveryAgent', 'superAdmin']}><OrderDetails /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute allowedRoles={['customer']}><Profile /></ProtectedRoute>} />
            <Route path="/restaurant/dashboard" element={<ProtectedRoute allowedRoles={['restaurantAdmin']}><RestaurantDashboard /></ProtectedRoute>} />
            <Route path="/delivery/dashboard" element={<ProtectedRoute allowedRoles={['deliveryAgent']}><DeliveryDashboard /></ProtectedRoute>} />
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['superAdmin']}><SuperAdminDashboard /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
        <LocationModal />
        <CartConflictModal />
      </CartProvider>
    </LocationProvider>
  </AuthProvider>
);

export default App;