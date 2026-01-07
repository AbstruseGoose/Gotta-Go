import Link from 'next/link';
import { mockBathrooms } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import { use } from 'react';

export default function BathroomDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const bathroom = mockBathrooms.find((b) => b.id === id);

  if (!bathroom) {
    notFound();
  }

  const ratings = [
    { label: 'Overall', value: bathroom.overall_rating, emoji: '⭐' },
    { label: 'Cleanliness', value: bathroom.cleanliness_rating, emoji: '✨' },
    { label: 'Smell', value: bathroom.smell_rating, emoji: '👃' },
    { label: 'Safety', value: bathroom.safety_rating, emoji: '🛡️' },
    { label: 'Supplies', value: bathroom.supplies_rating, emoji: '🧻' },
    { label: 'Accessibility', value: bathroom.accessibility_rating, emoji: '♿' },
    { label: 'Crowding', value: bathroom.crowding_rating, emoji: '👥' },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass-card border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="text-blue-400 hover:text-blue-300 mb-2 inline-block">
            ← Back to Map
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="glass-card rounded-xl shadow-2xl p-6">
          {/* Title */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">{bathroom.name}</h1>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 text-2xl">⭐</span>
                <span className="text-2xl font-bold">{bathroom.overall_rating?.toFixed(1)}</span>
                <span className="text-gray-400">({bathroom.review_count} reviews)</span>
              </div>
            </div>
            <span className="text-5xl">🚽</span>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-300">{bathroom.description}</p>
          </div>

          {/* Ratings Grid */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Ratings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ratings.map((rating) => (
                <div key={rating.label} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{rating.emoji}</span>
                      <span className="font-medium">{rating.label}</span>
                    </div>
                    <span className="text-xl font-bold">{rating.value?.toFixed(1) || 'N/A'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Location</h2>
            <p className="text-gray-400">
              {bathroom.latitude.toFixed(4)}, {bathroom.longitude.toFixed(4)}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg">
              Leave a Review
            </button>
            <button className="flex-1 glass-card px-6 py-3 rounded-lg hover:bg-white/15 transition-all font-semibold">
              Add Photo
            </button>
          </div>
        </div>

        {/* Reviews Section (Placeholder) */}
        <div className="glass-card rounded-xl shadow-2xl p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Reviews</h2>
          <p className="text-gray-400 text-center py-8">No reviews yet. Be the first to review!</p>
        </div>
      </div>
    </div>
  );
}
