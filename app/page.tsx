'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import BathroomCard from '@/components/BathroomCard';
import SortBar from '@/components/SortBar';
import Link from 'next/link';
import AccountMenu from '@/components/AccountMenu';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { mockBathrooms } from '@/lib/mock-data';
import { Bathroom } from '@/lib/supabase';

// Dynamic import to avoid SSR issues with mapbox-gl
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-6xl">🗺️</div>
    </div>
  ),
});

export default function Home() {
  const [bathrooms, setBathrooms] = useState<Bathroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('distance');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Fetch bathrooms from Supabase
  useEffect(() => {
    fetchBathrooms();
  }, []);

  const fetchBathrooms = async () => {
    try {
      if (!isSupabaseConfigured || !supabase) {
        // Fall back to mock data if Supabase not configured
        setBathrooms(mockBathrooms);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('bathrooms')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bathrooms:', error);
        // Fall back to mock data on error
        setBathrooms(mockBathrooms);
      } else if (data && data.length > 0) {
        setBathrooms(data);
      } else {
        // No bathrooms in database yet, use mock data
        setBathrooms(mockBathrooms);
      }
    } catch (error) {
      console.error('Error:', error);
      setBathrooms(mockBathrooms);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const sortedBathrooms = [...bathrooms].sort((a, b) => {
    if (sortBy === 'distance' && userLocation) {
      const distA = calculateDistance(userLocation.lat, userLocation.lng, a.latitude, a.longitude);
      const distB = calculateDistance(userLocation.lat, userLocation.lng, b.latitude, b.longitude);
      return distA - distB;
    }
    
    const ratingMap: { [key: string]: keyof Bathroom } = {
      overall: 'overall_rating',
      cleanliness: 'cleanliness_rating',
      smell: 'smell_rating',
      safety: 'safety_rating',
      supplies: 'supplies_rating',
      accessibility: 'accessibility_rating',
      crowding: 'crowding_rating',
    };

    const key = ratingMap[sortBy];
    if (key) {
      return (b[key] as number || 0) - (a[key] as number || 0);
    }

    return 0;
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass-card border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🚽</span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              GottaGo
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/add"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              + Add Bathroom
            </Link>
            <AccountMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Map View */}
          <div className="h-[500px] lg:h-[600px] rounded-xl overflow-hidden shadow-2xl glass-card">
            <MapView bathrooms={bathrooms} center={userLocation || undefined} />
          </div>

          {/* List View */}
          <div>
            <SortBar sortBy={sortBy} onSortChange={setSortBy} />
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {loading ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4 animate-bounce">🚽</div>
                  <p className="text-gray-400">Loading bathrooms...</p>
                </div>
              ) : sortedBathrooms.length === 0 ? (
                <div className="text-center py-12 glass-card rounded-xl p-8">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-xl font-semibold mb-2">No bathrooms yet!</p>
                  <p className="text-gray-400 mb-4">Be the first to add one</p>
                  <Link
                    href="/add"
                    className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                  >
                    + Add First Bathroom
                  </Link>
                </div>
              ) : (
                sortedBathrooms.map((bathroom) => {
                  const distance = userLocation
                    ? calculateDistance(
                        userLocation.lat,
                        userLocation.lng,
                        bathroom.latitude,
                        bathroom.longitude
                      )
                    : undefined;
                  return <BathroomCard key={bathroom.id} bathroom={bathroom} distance={distance} />;
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
