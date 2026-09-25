import React from 'react';
import {
  Clock,
  CheckCircle2,
  ChefHat,
  PackageCheck,
  UserCheck,
  Bike,
  Home,
  XCircle
} from 'lucide-react';

const ORDER_STEPS = [
  { key: 'Pending', label: 'Order Placed', icon: Clock },
  { key: 'Confirmed', label: 'Accepted', icon: CheckCircle2 },
  { key: 'Preparing', label: 'Kitchen Cooking', icon: ChefHat },
  { key: 'Ready for Pickup', label: 'Ready at Restaurant', icon: PackageCheck },
  { key: 'Assigned to Delivery Agent', label: 'Agent Assigned', icon: UserCheck },
  { key: 'Picked Up', label: 'Picked Up', icon: Bike },
  { key: 'Out for Delivery', label: 'Out for Delivery', icon: Bike },
  { key: 'Delivered', label: 'Delivered', icon: Home }
];

const OrderStatusTracker = ({ orderStatus, timeline = [] }) => {
  if (orderStatus === 'Cancelled') {
    return (
      <div className="tracking-card" style={{ borderColor: 'var(--danger-light)', background: '#fff5f5' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--danger)' }}>
          <XCircle size={32} />
          <div>
            <h3 style={{ margin: 0, color: 'var(--danger)' }}>Order Cancelled</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#991b1b' }}>
              This order has been cancelled.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentStepIndex = ORDER_STEPS.findIndex((s) => s.key === orderStatus);

  return (
    <div className="tracking-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 800, color: 'var(--text-muted)' }}>
            Live Tracking
          </span>
          <h3 style={{ fontSize: '1.35rem', margin: '2px 0 0 0', color: 'var(--text-main)' }}>
            Status: <span style={{ color: 'var(--primary)' }}>{orderStatus}</span>
          </h3>
        </div>
        <span className="badge badge-primary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
          Step {Math.max(1, currentStepIndex + 1)} of {ORDER_STEPS.length}
        </span>
      </div>

      {/* Progress Timeline Nodes */}
      <div className="timeline-steps">
        {ORDER_STEPS.map((step, idx) => {
          const isCompleted = currentStepIndex > idx;
          const isActive = currentStepIndex === idx;
          const StepIcon = step.icon;

          return (
            <div
              key={step.key}
              className={`timeline-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
            >
              <div className="step-node">
                {isCompleted ? <CheckCircle2 size={20} /> : <StepIcon size={18} />}
              </div>
              <span className="step-label">{step.label}</span>
            </div>
          );
        })}
      </div>

      {/* Status History Notes */}
      {timeline && timeline.length > 0 && (
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
          <h4 style={{ fontSize: '0.9rem', marginBottom: '10px', color: 'var(--text-muted)' }}>Recent Updates</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {timeline.slice(-3).reverse().map((entry, i) => (
              <div key={i} style={{ fontSize: '0.82rem', display: 'flex', gap: '10px', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-main)', minWidth: '85px' }}>
                  {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}:
                </span>
                <span style={{ color: 'var(--text-body)' }}>{entry.note || entry.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderStatusTracker;
