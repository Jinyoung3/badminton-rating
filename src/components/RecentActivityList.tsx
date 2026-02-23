'use client';

import { useState } from 'react';
import MatchCard from '@/components/MatchCard';
import { getRecentMatchesPage } from '@/actions/matches';

interface RecentActivityListProps {
  initialMatches: any[];
  userId: string;
}

const PAGE_SIZE = 5;

export default function RecentActivityList({ initialMatches, userId }: RecentActivityListProps) {
  const [matches, setMatches] = useState<any[]>(initialMatches);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialMatches.length === PAGE_SIZE);

  const handleLoadMore = async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);

    const nextMatches = await getRecentMatchesPage(PAGE_SIZE, matches.length);

    if (nextMatches.length < PAGE_SIZE) {
      setHasMore(false);
    }
    if (nextMatches.length === 0) {
      setIsLoading(false);
      return;
    }

    const seen = new Set(matches.map((m) => m.id));
    const unique = nextMatches.filter((m: any) => !seen.has(m.id));
    setMatches((prev) => [...prev, ...unique]);
    setIsLoading(false);
  };

  if (matches.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-4xl mb-2">📊</p>
        <p>No recent matches or events</p>
        <p className="text-sm mt-1">Start by recording a match or joining an event!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {matches.map((match) => (
        <MatchCard key={match.id} match={match} userId={userId} />
      ))}

      {hasMore && (
        <div className="pt-2">
          <button
            type="button"
            onClick={handleLoadMore}
            className="btn-secondary w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'View more games'}
          </button>
        </div>
      )}
    </div>
  );
}
