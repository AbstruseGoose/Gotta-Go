'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function AddBathroom() {
  const router = useRouter();
  const { user } = useAuth();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cleanliness: 5,
    accessibility: 5,
    privacy: 5,
    facilities: 5,
    overallRating: 5.0,
    amenities: {
      changingTable: false,
      accessible: false,
      genderNeutral: false,
      familyFriendly: false,
      airDryer: false,
      paperTowels: false,
      soap: false,
      sanitizer: false,
      changing_station: false,
      tampons: false,
    },
    requiresPurchase: false,
    keyRequired: false,
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get user's location automatically
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Please enable location services to add a bathroom.');
        }
      );
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location) {
      alert('Location not available. Please enable location services.');
      return;
    }

    if (!formData.name.trim()) {
      alert('Please enter a bathroom name.');
      return;
    }

    if (!user) {
      alert('You must be signed in to add a bathroom.');
      return;
    }

    setLoading(true);

    try {
      if (!isSupabaseConfigured || !supabase) {
        alert('Database not configured. Please set up Supabase to add bathrooms.');
        setLoading(false);
        return;
      }

      const bathroomData = {
        name: formData.name,
        description: formData.description,
        latitude: location.lat,
        longitude: location.lng,
        created_by: user.id,
        
        // Convert 0-10 ratings to 0-10 scale (already correct)
        cleanliness_rating: formData.cleanliness,
        accessibility_rating: formData.accessibility,
        privacy_rating: formData.privacy,
        facilities_rating: formData.facilities,
        overall_rating: formData.overallRating,
        
        // Amenities
        has_changing_table: formData.amenities.changingTable,
        has_accessible: formData.amenities.accessible,
        has_gender_neutral: formData.amenities.genderNeutral,
        has_family_friendly: formData.amenities.familyFriendly,
        has_air_dryer: formData.amenities.airDryer,
        has_paper_towels: formData.amenities.paperTowels,
        has_soap: formData.amenities.soap,
        has_sanitizer: formData.amenities.sanitizer,
        has_changing_station: formData.amenities.changing_station,
        has_tampons: formData.amenities.tampons,
        
        // Access
        requires_purchase: formData.requiresPurchase,
        key_required: formData.keyRequired,
        
        // Notes
        notes: formData.notes,
        
        // Auto-approve for now (can be changed to require moderation)
        is_approved: true,
      };

      const { data, error } = await supabase
        .from('bathrooms')
        .insert([bathroomData])
        .select()
        .single();

      if (error) throw error;

      alert('Bathroom added successfully! 🚽');
      router.push('/');
    } catch (error) {
      console.error('Error adding bathroom:', error);
      alert('Error adding bathroom. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass-card border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link href="/" className="text-blue-400 hover:text-blue-300 mb-2 inline-block">
            ← Back to Map
          </Link>
        </div>
      </header>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="glass-card rounded-xl shadow-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl">🚽</span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Add a Bathroom</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Location Status */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">📍</span>
                <span className="font-semibold">Location</span>
              </div>
              {location ? (
                <p className="text-sm text-blue-200">
                  Using your current location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </p>
              ) : (
                <p className="text-sm text-blue-300">Getting your location...</p>
              )}
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Bathroom Name *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Starbucks Downtown"
                className="w-full p-3 glass-card rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/5"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Where is it located? Any access notes?"
                rows={4}
                className="w-full p-3 glass-card rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/5"
              />
            </div>

            {/* Overall Rating */}
            <div>
              <label className="block text-sm font-medium mb-3">
                Overall Rating ⭐ {formData.overallRating.toFixed(1)}
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={formData.overallRating}
                  onChange={(e) => setFormData({ ...formData, overallRating: parseFloat(e.target.value) })}
                  className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(formData.overallRating / 5) * 100}%, rgba(255,255,255,0.1) ${(formData.overallRating / 5) * 100}%, rgba(255,255,255,0.1) 100%)`
                  }}
                />
                <span className="text-2xl min-w-[3rem] text-center">{'⭐'.repeat(Math.round(formData.overallRating))}</span>
              </div>
            </div>

            {/* Detailed Ratings */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Detailed Ratings</h3>
              
              {/* Cleanliness */}
              <div>
                <label className="block text-sm mb-2 flex items-center justify-between">
                  <span>🧼 Cleanliness</span>
                  <span className="text-blue-400">{formData.cleanliness}/10</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={formData.cleanliness}
                  onChange={(e) => setFormData({ ...formData, cleanliness: parseInt(e.target.value) })}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #10b981 0%, #10b981 ${(formData.cleanliness / 10) * 100}%, rgba(255,255,255,0.1) ${(formData.cleanliness / 10) * 100}%, rgba(255,255,255,0.1) 100%)`
                  }}
                />
              </div>

              {/* Accessibility */}
              <div>
                <label className="block text-sm mb-2 flex items-center justify-between">
                  <span>♿ Accessibility</span>
                  <span className="text-blue-400">{formData.accessibility}/10</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={formData.accessibility}
                  onChange={(e) => setFormData({ ...formData, accessibility: parseInt(e.target.value) })}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(formData.accessibility / 10) * 100}%, rgba(255,255,255,0.1) ${(formData.accessibility / 10) * 100}%, rgba(255,255,255,0.1) 100%)`
                  }}
                />
              </div>

              {/* Privacy */}
              <div>
                <label className="block text-sm mb-2 flex items-center justify-between">
                  <span>🔒 Privacy</span>
                  <span className="text-blue-400">{formData.privacy}/10</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={formData.privacy}
                  onChange={(e) => setFormData({ ...formData, privacy: parseInt(e.target.value) })}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${(formData.privacy / 10) * 100}%, rgba(255,255,255,0.1) ${(formData.privacy / 10) * 100}%, rgba(255,255,255,0.1) 100%)`
                  }}
                />
              </div>

              {/* Facilities */}
              <div>
                <label className="block text-sm mb-2 flex items-center justify-between">
                  <span>🚿 Facilities Quality</span>
                  <span className="text-blue-400">{formData.facilities}/10</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={formData.facilities}
                  onChange={(e) => setFormData({ ...formData, facilities: parseInt(e.target.value) })}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${(formData.facilities / 10) * 100}%, rgba(255,255,255,0.1) ${(formData.facilities / 10) * 100}%, rgba(255,255,255,0.1) 100%)`
                  }}
                />
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Amenities & Features</h3>
              
              <div className="grid grid-cols-2 gap-3">
                {Object.entries({
                  changingTable: '👶 Changing Table',
                  accessible: '♿ Wheelchair Accessible',
                  genderNeutral: '🚻 Gender Neutral',
                  familyFriendly: '👨‍👩‍👧‍👦 Family Friendly',
                  airDryer: '💨 Air Dryer',
                  paperTowels: '📄 Paper Towels',
                  soap: '🧴 Soap',
                  sanitizer: '🧼 Hand Sanitizer',
                  changing_station: '👕 Changing Station',
                  tampons: '🩹 Period Products',
                }).map(([key, label]) => (
                  <label
                    key={key}
                    className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all ${
                      formData.amenities[key as keyof typeof formData.amenities]
                        ? 'glass-card border-blue-500'
                        : 'glass-card border-white/10'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.amenities[key as keyof typeof formData.amenities]}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          amenities: { ...formData.amenities, [key]: e.target.checked },
                        })
                      }
                      className="w-5 h-5 rounded"
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Access Requirements */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Access Requirements</h3>
              
              <label className="flex items-center gap-3 p-3 glass-card rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.requiresPurchase}
                  onChange={(e) => setFormData({ ...formData, requiresPurchase: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <span>💰 Requires Purchase</span>
              </label>

              <label className="flex items-center gap-3 p-3 glass-card rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.keyRequired}
                  onChange={(e) => setFormData({ ...formData, keyRequired: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <span>🔑 Key/Code Required</span>
              </label>
            </div>

            {/* Additional Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium mb-2">
                Additional Notes
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any other important details?"
                rows={3}
                className="w-full p-3 glass-card rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/5"
              />
            </div>

            {/* Photo Upload (Placeholder) */}
            <div>
              <label className="block text-sm font-medium mb-2">Photos</label>
              <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center glass-card">
                <span className="text-4xl mb-2 block">📷</span>
                <p className="text-gray-400 text-sm">Photo upload coming soon</p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !location}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'Adding...' : 'Add Bathroom'}
            </button>
          </form>

          <p className="text-sm text-gray-400 mt-4 text-center">
            * Location is automatically set to your current position
          </p>
        </div>
      </div>
    </div>
  );
}
