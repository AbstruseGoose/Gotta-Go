'use client';

import { useState, useEffect } from 'react';
import { Bathroom } from '@/lib/supabase';
import Link from 'next/link';

interface MapViewProps {
  bathrooms: Bathroom[];
  center?: { lat: number; lng: number };
}

export default function MapView({ bathrooms, center }: MapViewProps) {
  const [selectedBathroom, setSelectedBathroom] = useState<Bathroom | null>(null);
  const [mapUrl, setMapUrl] = useState('');
  const [zoom, setZoom] = useState(12);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState({ 
    lng: center?.lng || -73.9851, 
    lat: center?.lat || 40.7589 
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState(0);
  
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied or unavailable:', error);
        }
      );
    }
  }, []);

  useEffect(() => {
    if (mapboxToken && mapboxToken !== 'your-mapbox-token') {
      // Create markers parameter for Mapbox Static API
      const markers = bathrooms.map(b => 
        `pin-s+3b82f6(${b.longitude},${b.latitude})`
      ).join(',');
      
      // Add user location marker if available (red pin)
      const userMarker = userLocation ? `pin-l+ef4444(${userLocation.lng},${userLocation.lat})` : '';
      const allMarkers = userMarker ? `${markers},${userMarker}` : markers;
      
      // Mapbox Static API URL
      const url = `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/${allMarkers}/${mapCenter.lng},${mapCenter.lat},${zoom},0/800x600@2x?access_token=${mapboxToken}`;
      setMapUrl(url);
    }
  }, [bathrooms, mapboxToken, zoom, userLocation, mapCenter]);

  // Handle mouse drag to pan
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    
    // Convert pixel movement to lat/lng (rough approximation)
    const scale = 0.0001 * Math.pow(2, 18 - zoom);
    
    setMapCenter(prev => ({
      lng: prev.lng - dx * scale,
      lat: prev.lat + dy * scale
    }));
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle scroll to zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -1 : 1;
    setZoom(prev => Math.max(1, Math.min(18, prev + delta)));
  };

  // Handle touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setLastTouchDistance(distance);
    } else if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch to zoom
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      
      if (lastTouchDistance > 0) {
        const delta = distance > lastTouchDistance ? 0.5 : -0.5;
        setZoom(prev => Math.max(1, Math.min(18, prev + delta)));
      }
      
      setLastTouchDistance(distance);
    } else if (e.touches.length === 1 && isDragging) {
      // Drag to pan
      const dx = e.touches[0].clientX - dragStart.x;
      const dy = e.touches[0].clientY - dragStart.y;
      
      const scale = 0.0001 * Math.pow(2, 18 - zoom);
      
      setMapCenter(prev => ({
        lng: prev.lng - dx * scale,
        lat: prev.lat + dy * scale
      }));
      
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setLastTouchDistance(0);
  };

  if (!mapboxToken || mapboxToken === 'your-mapbox-token') {
    return (
      <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black rounded-lg flex items-center justify-center">
        <div className="text-center p-6">
          <div className="text-6xl mb-4">🗺️</div>
          <p className="text-gray-400 mb-2">Map Loading...</p>
          <p className="text-sm text-gray-500">Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-lg overflow-hidden relative">
      {/* Static Map Image with built-in markers */}
      {mapUrl && (
        <img 
          src={mapUrl} 
          alt="Map" 
          className={`w-full h-full object-cover select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          draggable={false}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      )}

      {/* Map Info */}
      <div className="absolute bottom-4 left-4 bg-gray-900/90 backdrop-blur-xl border border-gray-700 rounded-lg p-3 shadow-lg z-20">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-2xl">🗺️</span>
          <div>
            <p className="font-semibold">NYC Area Map</p>
            <p className="text-xs text-gray-400">
              {userLocation ? '📍 Your location shown in red' : 'Click markers for details'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
