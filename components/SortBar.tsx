'use client';

interface SortBarProps {
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export default function SortBar({ sortBy, onSortChange }: SortBarProps) {
  const sortOptions = [
    { value: 'distance', label: 'Closest' },
    { value: 'overall', label: 'Overall Rating' },
    { value: 'cleanliness', label: 'Cleanliness' },
    { value: 'smell', label: 'Smell' },
    { value: 'safety', label: 'Safety' },
    { value: 'supplies', label: 'Supplies' },
    { value: 'accessibility', label: 'Accessibility' },
    { value: 'crowding', label: 'Least Crowded' },
  ];

  return (
    <div className="glass-card rounded-xl p-4 mb-4">
      <label className="block text-sm font-medium mb-2">Sort by:</label>
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="w-full p-2 glass-card rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/5 border border-white/20"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value} className="bg-slate-900">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
