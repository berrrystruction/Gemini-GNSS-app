import React, { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap, Marker, Circle } from 'leaflet';
import Card from './Card';
import type { PositionState } from '../types';

declare const L: any; // Use Leaflet from CDN

const MapTab: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const circleRef = useRef<Circle | null>(null);

  const [position, setPosition] = useState<PositionState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState<boolean>(true);

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current).setView([51.505, -0.09], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      mapRef.current = map;
    }

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    let watcherId: number;

    if (isTracking) {
      watcherId = navigator.geolocation.watchPosition(
        (pos) => {
          // FIX: The 'timestamp' property is on the GeolocationPosition object itself, not on 'coords'.
          const { latitude, longitude, accuracy, altitude, speed } = pos.coords;
          const newPosition = { lat: latitude, lng: longitude, accuracy, altitude, speed, timestamp: pos.timestamp };
          setPosition(newPosition);
          setError(null);

          if (mapRef.current) {
            mapRef.current.setView([latitude, longitude], 16);
            if (!markerRef.current) {
              markerRef.current = L.marker([latitude, longitude]).addTo(mapRef.current);
              markerRef.current.bindPopup("Your Location").openPopup();
            } else {
              markerRef.current.setLatLng([latitude, longitude]);
            }

            if (!circleRef.current) {
              circleRef.current = L.circle([latitude, longitude], {
                radius: accuracy,
                weight: 1,
                color: '#1d4ed8',
                fillColor: '#3b82f6',
                fillOpacity: 0.2,
              }).addTo(mapRef.current);
            } else {
              circleRef.current.setLatLng([latitude, longitude]).setRadius(accuracy);
            }
          }
        },
        (err) => {
          if (err.code === err.PERMISSION_DENIED) {
            setError("Location access denied. Please enable location services in your browser settings.");
          } else {
            setError(`Error getting location: ${err.message}`);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    }
    
    return () => {
      if (watcherId) {
        navigator.geolocation.clearWatch(watcherId);
      }
    };
  }, [isTracking]);

  const toggleTracking = () => {
    setIsTracking(prev => !prev);
    if (isTracking) {
      setError("Tracking paused.");
    } else {
       setError(null);
       if(!position) setPosition(null)
    }
  };


  return (
    <Card title="GNSS Position">
        <div className="h-96 md:h-[500px] w-full bg-slate-700 rounded-lg mb-4 shadow-inner" ref={mapContainerRef}>
            {!position && !error && <div className="flex items-center justify-center h-full text-slate-400">Waiting for location data...</div>}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
            <div className="bg-slate-700 p-3 rounded-lg"><span className="block text-xs text-sky-400">Latitude</span>{position ? position.lat.toFixed(6) : 'N/A'}</div>
            <div className="bg-slate-700 p-3 rounded-lg"><span className="block text-xs text-sky-400">Longitude</span>{position ? position.lng.toFixed(6) : 'N/A'}</div>
            <div className="bg-slate-700 p-3 rounded-lg"><span className="block text-xs text-sky-400">Altitude</span>{position?.altitude ? `${position.altitude.toFixed(1)} m` : 'N/A'}</div>
            <div className="bg-slate-700 p-3 rounded-lg"><span className="block text-xs text-sky-400">Accuracy</span>{position ? `${position.accuracy.toFixed(1)} m` : 'N/A'}</div>
            <div className="bg-slate-700 p-3 rounded-lg"><span className="block text-xs text-sky-400">Speed</span>{position?.speed ? `${(position.speed * 3.6).toFixed(1)} km/h` : 'N/A'}</div>
            <div className="bg-slate-700 p-3 rounded-lg"><span className="block text-xs text-sky-400">Timestamp</span>{position?.timestamp ? new Date(position.timestamp).toLocaleTimeString() : 'N/A'}</div>
        </div>
        {error && <div className="mt-4 text-center text-amber-400 bg-amber-900/50 p-3 rounded-lg">{error}</div>}
        <div className="mt-4 flex justify-center">
             <button onClick={toggleTracking} className={`px-6 py-2 rounded-lg font-semibold transition-colors ${isTracking ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
                {isTracking ? 'Stop Tracking' : 'Start Tracking'}
             </button>
        </div>
    </Card>
  );
};

export default MapTab;