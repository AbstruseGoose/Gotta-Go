import Link from 'next/link';
import { Bathroom } from '@/lib/supabase';

interface BathroomCardProps {
  bathroom: Bathroom;
  distance?: number;
}

export default function BathroomCard({ bathroom, distance }: BathroomCardProps) {
  return (
    <Link href={`/bathroom/${bathroom.id}`}>
      <div className="glass-card-hover rounded-xl p-4 cursor-pointer">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg">{bathroom.name}</h3>
          {distance !== undefined && (
            <span className="text-sm text-blue-300">{distance.toFixed(1)} mi</span>
          )}
        </div>

        <p className="text-gray-300 text-sm mb-3 line-clamp-2">{bathroom.description}</p>

        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">⭐</span>
            <span className="font-semibold">{bathroom.overall_rating?.toFixed(1) || 'N/A'}</span>
          </div>
          <span className="text-sm text-gray-400">
            {bathroom.review_count || 0} reviews
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex flex-col">
            <span className="text-gray-400">Cleanliness</span>
            <span className="font-medium text-blue-300">{bathroom.cleanliness_rating?.toFixed(1) || 'N/A'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-400">Safety</span>
            <span className="font-medium text-blue-300">{bathroom.safety_rating?.toFixed(1) || 'N/A'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-400">Supplies</span>
            <span className="font-medium text-blue-300">{bathroom.supplies_rating?.toFixed(1) || 'N/A'}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
