import React from 'react';
import { useCart } from '../context/CartContext';
import { AlertCircle, Trash2, X } from 'lucide-react';

const CartConflictModal = () => {
  const {
    isConflictModalOpen,
    restaurant: existingRestaurant,
    conflictData,
    confirmClearAndAdd,
    cancelConflict
  } = useCart();

  if (!isConflictModalOpen || !conflictData) return null;

  return (
    <div className="modal-backdrop" onClick={cancelConflict}>
      <div className="modal-content" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ color: 'var(--danger)' }}>
            <AlertCircle size={22} /> Replace Cart Items?
          </div>
          <button className="modal-close-btn" onClick={cancelConflict}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ textAlign: 'center', padding: '24px 20px' }}>
          <p style={{ fontSize: '0.98rem', color: 'var(--text-body)', lineHeight: 1.5, marginBottom: '16px' }}>
            Your cart already contains delicious items from <strong>{existingRestaurant?.name || 'another restaurant'}</strong>.
          </p>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Would you like to clear your current cart and start a fresh order from <strong>{conflictData.restaurant?.name}</strong>?
          </p>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'center', gap: '14px' }}>
          <button className="btn btn-secondary" onClick={cancelConflict}>
            Keep Existing Cart
          </button>
          <button className="btn btn-danger" onClick={confirmClearAndAdd}>
            <Trash2 size={16} /> Clear & Add New
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartConflictModal;
