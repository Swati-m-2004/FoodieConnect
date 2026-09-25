import React, { useState } from 'react';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import MapPicker from './MapPicker';
import { MapPin, Navigation, X, Home, Briefcase, GraduationCap, CheckCircle } from 'lucide-react';

const LocationModal = () => {
  const {
    selectedLocation,
    updateLocation,
    useCurrentLocation,
    isLocating,
    isLocationModalOpen,
    closeLocationModal
  } = useLocation();

  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('map'); // 'map' | 'saved'
  const [tempLocation, setTempLocation] = useState(selectedLocation);

  if (!isLocationModalOpen) return null;

  const handleSavedSelect = (addr) => {
    updateLocation({
      area: addr.area,
      city: addr.city,
      pincode: addr.pincode,
      fullAddress: addr.fullAddress || `${addr.house ? addr.house + ', ' : ''}${addr.area}, ${addr.city}`,
      coordinates: addr.location?.coordinates || [75.6267, 15.4284]
    });
  };

  const handleConfirmTempLocation = () => {
    if (tempLocation) {
      updateLocation(tempLocation);
    }
  };

  const getLabelIcon = (label) => {
    const l = (label || '').toLowerCase();
    if (l.includes('home')) return <Home size={16} />;
    if (l.includes('office') || l.includes('work')) return <Briefcase size={16} />;
    if (l.includes('college') || l.includes('school')) return <GraduationCap size={16} />;
    return <MapPin size={16} />;
  };

  return (
    <div className="modal-backdrop" onClick={closeLocationModal}>
      <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <MapPin color="var(--primary)" size={24} />
            Where do you want your food delivered?
          </div>
          <button className="modal-close-btn" onClick={closeLocationModal}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Top action buttons */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-outline btn-sm"
              onClick={useCurrentLocation}
              disabled={isLocating}
              style={{ flex: 1 }}
            >
              <Navigation size={16} color="var(--primary)" />
              {isLocating ? 'Detecting GPS...' : 'Use Current Location'}
            </button>

            {user && user.addresses && user.addresses.length > 0 && (
              <button
                className={`btn btn-sm ${activeTab === 'saved' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab(activeTab === 'saved' ? 'map' : 'saved')}
              >
                Saved Addresses ({user.addresses.length})
              </button>
            )}
          </div>

          {/* Saved Addresses list */}
          {activeTab === 'saved' && user && user.addresses && user.addresses.length > 0 ? (
            <div className="saved-addr-list">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Select one of your saved delivery addresses:
              </p>
              {user.addresses.map((addr) => {
                const isSelected =
                  selectedLocation.area === addr.area &&
                  selectedLocation.city === addr.city;
                return (
                  <div
                    key={addr._id}
                    className={`saved-addr-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSavedSelect(addr)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: 'var(--primary-light)',
                          color: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {getLabelIcon(addr.label)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.92rem' }}>
                          {addr.label || 'Saved Location'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {addr.fullAddress || `${addr.area}, ${addr.city} - ${addr.pincode}`}
                        </div>
                      </div>
                    </div>
                    {isSelected && <CheckCircle size={20} color="var(--primary)" />}
                  </div>
                );
              })}
              <button
                className="btn btn-outline btn-sm"
                style={{ marginTop: '12px' }}
                onClick={() => setActiveTab('map')}
              >
                Pin Another Location on Map
              </button>
            </div>
          ) : (
            /* Interactive Map Picker */
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Search your address or drag the map pin to set your exact delivery coordinates:
              </p>
              <MapPicker
                initialCoordinates={selectedLocation.coordinates || [75.6267, 15.4284]}
                onLocationSelect={(loc) => setTempLocation(loc)}
                height="290px"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={closeLocationModal}>
            Cancel
          </button>
          {activeTab === 'map' && (
            <button className="btn btn-primary" onClick={handleConfirmTempLocation}>
              Confirm Delivery Location
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
