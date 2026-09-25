import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const LocationContext = createContext();

const DEFAULT_LOCATION = {
  area: 'Station Road',
  city: 'Gadag',
  pincode: '582101',
  fullAddress: 'Station Road, Gadag, Karnataka 582101',
  coordinates: [75.6267, 15.4284] // [lng, lat]
};

export const LocationProvider = ({ children }) => {
  const [selectedLocation, setSelectedLocation] = useState(() => {
    const saved = localStorage.getItem('foodie_location');
    return saved ? JSON.parse(saved) : DEFAULT_LOCATION;
  });

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    localStorage.setItem('foodie_location', JSON.stringify(selectedLocation));
  }, [selectedLocation]);

  const updateLocation = (loc) => {
    const formatted = {
      area: loc.area || 'Central Area',
      city: loc.city || 'Gadag',
      pincode: loc.pincode || '582101',
      fullAddress: loc.fullAddress || `${loc.area || ''}, ${loc.city || ''} ${loc.pincode || ''}`,
      coordinates: Array.isArray(loc.coordinates) && loc.coordinates.length === 2
        ? [parseFloat(loc.coordinates[0]), parseFloat(loc.coordinates[1])]
        : DEFAULT_LOCATION.coordinates
    };
    setSelectedLocation(formatted);
    setIsLocationModalOpen(false);
  };

  // Browser Geolocation with Nominatim Reverse Geocoding
  const useCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          // OpenStreetMap Nominatim reverse geocode
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
          );

          if (response.data && response.data.address) {
            const addr = response.data.address;
            const area = addr.suburb || addr.neighbourhood || addr.road || 'Current Locality';
            const city = addr.city || addr.town || addr.village || 'Gadag';
            const pincode = addr.postcode || '582101';
            const fullAddress = response.data.display_name;

            updateLocation({
              area,
              city,
              pincode,
              fullAddress,
              coordinates: [lng, lat]
            });
          } else {
            updateLocation({
              area: 'Detected Location',
              city: 'Current Area',
              pincode: '',
              fullAddress: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
              coordinates: [lng, lat]
            });
          }
        } catch (err) {
          console.warn('Reverse geocode fallback:', err.message);
          updateLocation({
            area: 'Current Location',
            city: 'Gadag',
            pincode: '582101',
            fullAddress: `Detected Coordinates: [${lng.toFixed(4)}, ${lat.toFixed(4)}]`,
            coordinates: [lng, lat]
          });
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error('Geolocation Error:', error);
        setLocationError('Unable to retrieve location. Please choose manually.');
        setIsLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const openLocationModal = () => setIsLocationModalOpen(true);
  const closeLocationModal = () => setIsLocationModalOpen(false);

  return (
    <LocationContext.Provider
      value={{
        selectedLocation,
        updateLocation,
        useCurrentLocation,
        isLocating,
        locationError,
        isLocationModalOpen,
        openLocationModal,
        closeLocationModal
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
