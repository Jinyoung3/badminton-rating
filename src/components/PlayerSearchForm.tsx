'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface PlayerSearchFormProps {
  initialParams: {
    query?: string;
    location?: string;
    minRating?: string;
    maxRating?: string;
    gameType?: string;
  };
}

export default function PlayerSearchForm({ initialParams }: PlayerSearchFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const [query, setQuery] = useState(initialParams.query || '');
  const [location, setLocation] = useState(initialParams.location || '');
  const [minRating, setMinRating] = useState(initialParams.minRating || '');
  const [maxRating, setMaxRating] = useState(initialParams.maxRating || '');
  const [gameType, setGameType] = useState(initialParams.gameType || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (query) params.set('query', query);
    if (location) params.set('location', location);
    if (minRating) params.set('minRating', minRating);
    if (maxRating) params.set('maxRating', maxRating);
    if (gameType) params.set('gameType', gameType);

    startTransition(() => {
      router.push(`/player?${params.toString()}`);
    });
  };

  const handleClear = () => {
    setQuery('');
    setLocation('');
    setMinRating('');
    setMaxRating('');
    setGameType('');
    
    startTransition(() => {
      router.push('/player');
    });
  };

  return (
    <form onSubmit={handleSearch} className="card">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Name Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Player Name
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name..."
            className="input-field"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, State..."
            className="input-field"
          />
        </div>

        {/* Game Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Preferred Game Type
          </label>
          <select
            value={gameType}
            onChange={(e) => setGameType(e.target.value)}
            className="input-field"
          >
            <option value="">Any</option>
            <option value="Singles">Singles</option>
            <option value="Doubles">Doubles</option>
          </select>
        </div>

        {/* Min Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Min Rating
          </label>
          <input
            type="number"
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            placeholder="0"
            min="0"
            max="9000"
            className="input-field"
          />
        </div>

        {/* Max Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Rating
          </label>
          <input
            type="number"
            value={maxRating}
            onChange={(e) => setMaxRating(e.target.value)}
            placeholder="9000"
            min="0"
            max="9000"
            className="input-field"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary flex-1"
        >
          {isPending ? 'Searching...' : '🔍 Search'}
        </button>
        <button
          type="button"
          onClick={handleClear}
          disabled={isPending}
          className="btn-secondary"
        >
          Clear
        </button>
      </div>
    </form>
  );
}