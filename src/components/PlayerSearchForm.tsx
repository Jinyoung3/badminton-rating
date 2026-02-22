'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const LIVE_SEARCH_DEBOUNCE_MS = 400;
const MIN_CHARS_FOR_LIVE_SEARCH = 2;

interface PlayerSearchFormProps {
  initialParams: {
    query?: string;
    location?: string;
    minRating?: string;
    maxRating?: string;
    gameType?: string;
  };
}

function buildSearchUrl(params: { query: string; location: string; minRating: string; maxRating: string; gameType: string }) {
  const sp = new URLSearchParams();
  if (params.query) sp.set('query', params.query);
  if (params.location) sp.set('location', params.location);
  if (params.minRating) sp.set('minRating', params.minRating);
  if (params.maxRating) sp.set('maxRating', params.maxRating);
  if (params.gameType) sp.set('gameType', params.gameType);
  return `/player?${sp.toString()}`;
}

export default function PlayerSearchForm({ initialParams }: PlayerSearchFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isInitialMount = useRef(true);

  const [query, setQuery] = useState(initialParams.query || '');
  const [location, setLocation] = useState(initialParams.location || '');
  const [minRating, setMinRating] = useState(initialParams.minRating || '');
  const [maxRating, setMaxRating] = useState(initialParams.maxRating || '');
  const [gameType, setGameType] = useState(initialParams.gameType || '');

  // Live search: when name has 2+ chars (or is cleared), update URL after debounce so results refresh
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const t = setTimeout(() => {
      const runLive = query.length >= MIN_CHARS_FOR_LIVE_SEARCH || query.length === 0;
      if (!runLive) return;
      startTransition(() => {
        router.push(buildSearchUrl({ query, location, minRating, maxRating, gameType }));
      });
    }, LIVE_SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      router.push(buildSearchUrl({ query, location, minRating, maxRating, gameType }));
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
        {/* Name Search — filters as you type (after 2+ chars, 400ms debounce) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Player Name
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name (e.g. John)..."
            className="input-field"
          />
          {/* <p className="text-xs text-gray-500 mt-1">
            Live search after 2+ letters. Or click Search to apply all filters.
          </p> */}
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
            max="3000"
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
            placeholder="3000"
            min="0"
            max="3000"
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