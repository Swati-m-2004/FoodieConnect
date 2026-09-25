import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import axios from 'axios';
import { MapPin, Search, Navigation } from 'lucide-react';

// Fix standard leaflet icon path issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const MapPicker = ({ initialCoordinates = [75.6267, 15.4284], onLocationSelect, height = '260px' }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [coords, setCoords] = useState(initialCoordinates); // [lng, lat]
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [addressPreview, setAddressPreview] = useState('');

  // Reverse geocode to get address from [lng, lat]
  const reverseGeocode = async (lng, lat) => {
    try {
      const { data } = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      if (data && data.address) {
        const addr = data.address;
        const area = addr.suburb || addr.neighbourhood || addr.road || addr.quarter || 'Locality';
        const city = addr.city || addr.town || addr.village || addr.county || 'Gadag';
        const pincode = addr.postcode || '582101';
        const fullAddress = data.display_name;

        const locData = {
          area,
          city,
          pincode,
          fullAddress,
          coordinates: [lng, lat]
        };
        setAddressPreview(fullAddress);
        if (onLocationSelect) onLocationSelect(locData);
      }
    } catch (err) {
      console.warn('Reverse geocode error:', err.message);
      const fallback = {
        area: 'Selected Location',
        city: 'Karnataka',
        pincode: '582101',
        fullAddress: `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        coordinates: [lng, lat]
      };
      setAddressPreview(fallback.fullAddress);
      if (onLocationSelect) onLocationSelect(fallback);
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Leaflet uses [lat, lng]
    const initialLat = initialCoordinates[1];
    const initialLng = initialCoordinates[0];

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([initialLat, initialLng], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      const marker = L.marker([initialLat, initialLng], {
        draggable: true
      }).addTo(map);

      // On marker drag end
      marker.on('dragend', (e) => {
        const position = e.target.getLatLng();
        setCoords([position.lng, position.lat]);
        reverseGeocode(position.lng, position.lat);
      });

      // On map click, move marker
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setCoords([lng, lat]);
        reverseGeocode(lng, lat);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Initial reverse geocode
      reverseGeocode(initialLng, initialLat);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Forward geocode search address
  const handleSearchAddress = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const { data } = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );

      if (data && data.length > 0) {
        const place = data[0];
        const lat = parseFloat(place.lat);
        const lng = parseFloat(place.lon);

        setCoords([lng, lat]);

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([lat, lng], 15);
          markerRef.current.setLatLng([lat, lng]);
        }

        reverseGeocode(lng, lat);
      } else {
        alert('Location not found. Please try typing another locality or city name.');
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Address Search Bar */}
      <form onSubmit={handleSearchAddress} className="map-search-bar">
        <input
          type="text"
          className="form-input"
          placeholder="Search street, area, town (e.g., Station Road, Gadag)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="btn btn-primary btn-sm" disabled={isSearching}>
          <Search size={16} /> {isSearching ? 'Locating...' : 'Search'}
        </button>
      </form>

      {/* Interactive Map */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height,
          borderRadius: 'var(--radius-md)',
          border: '1.5px solid var(--border)',
          overflow: 'hidden'
        }}
      />

      {/* Coordinates Note & Address Preview */}
      <div className="map-status-note">
        <MapPin size={16} color="var(--primary)" />
        <span style={{ fontSize: '0.84rem', color: 'var(--text-body)', fontWeight: '600' }}>
          {addressPreview ? addressPreview.substring(0, 85) + '...' : 'Click or drag pin on map to set your location'}
        </span>
      </div>
    </div>
  );
};

export default MapPicker;
