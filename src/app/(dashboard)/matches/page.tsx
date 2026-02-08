import { getMatches } from '@/actions/matches';
import { getCurrentUser } from '@/actions/user';
import { redirect } from 'next/navigation';
import MatchCard from '@/components/MatchCard';
import Link from 'next/link';

interface MatchesPageProps {
  searchParams: {
    gameType?: 'singles' | 'doubles';
    matchType?: 'event' | 'challenge' | 'practice';
    page?: string;
  };
}

export default async function MatchesPage({ searchParams }: MatchesPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  const page = parseInt(searchParams.page || '1');
  const limit = 20;
  const offset = (page - 1) * limit;

  const { matches, total } = await getMatches({
    playerId: user.id,
    gameType: searchParams.gameType,
    matchType: searchParams.matchType,
    limit,
    offset,
  });

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">📜 Match History</h1>
        <p className="text-gray-600 mt-2">
          View all your matches with filters
        </p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Game Type
            </label>
            <div className="flex gap-2">
              <Link
                href="/matches"
                className={`px-4 py-2 rounded border ${
                  !searchParams.gameType
                    ? 'bg-primary-100 border-primary-500 text-primary-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                All
              </Link>
              <Link
                href="/matches?gameType=singles"
                className={`px-4 py-2 rounded border ${
                  searchParams.gameType === 'singles'
                    ? 'bg-primary-100 border-primary-500 text-primary-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                Singles
              </Link>
              <Link
                href="/matches?gameType=doubles"
                className={`px-4 py-2 rounded border ${
                  searchParams.gameType === 'doubles'
                    ? 'bg-primary-100 border-primary-500 text-primary-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                Doubles
              </Link>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Match Type
            </label>
            <div className="flex gap-2">
              <Link
                href={`/matches${searchParams.gameType ? `?gameType=${searchParams.gameType}` : ''}`}
                className={`px-4 py-2 rounded border text-sm ${
                  !searchParams.matchType
                    ? 'bg-primary-100 border-primary-500 text-primary-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                All
              </Link>
              <Link
                href={`/matches?matchType=event${searchParams.gameType ? `&gameType=${searchParams.gameType}` : ''}`}
                className={`px-4 py-2 rounded border text-sm ${
                  searchParams.matchType === 'event'
                    ? 'bg-primary-100 border-primary-500 text-primary-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                Event
              </Link>
              <Link
                href={`/matches?matchType=challenge${searchParams.gameType ? `&gameType=${searchParams.gameType}` : ''}`}
                className={`px-4 py-2 rounded border text-sm ${
                  searchParams.matchType === 'challenge'
                    ? 'bg-primary-100 border-primary-500 text-primary-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                Challenge
              </Link>
              <Link
                href={`/matches?matchType=practice${searchParams.gameType ? `&gameType=${searchParams.gameType}` : ''}`}
                className={`px-4 py-2 rounded border text-sm ${
                  searchParams.matchType === 'practice'
                    ? 'bg-primary-100 border-primary-500 text-primary-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                Practice
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Matches ({total} total)
          </h2>
          {totalPages > 1 && (
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
          )}
        </div>

        {matches.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-4xl mb-2">🏸</p>
            <p className="text-gray-600">No matches found</p>
            <p className="text-sm text-gray-500 mt-1">
              Try adjusting your filters or play some matches!
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {matches.map((match: any) => (
                <MatchCard key={match.id} match={match} userId={user.id} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                {page > 1 && (
                  <Link
                    href={`/matches?page=${page - 1}${searchParams.gameType ? `&gameType=${searchParams.gameType}` : ''}${searchParams.matchType ? `&matchType=${searchParams.matchType}` : ''}`}
                    className="btn-secondary"
                  >
                    ← Previous
                  </Link>
                )}
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <Link
                    href={`/matches?page=${page + 1}${searchParams.gameType ? `&gameType=${searchParams.gameType}` : ''}${searchParams.matchType ? `&matchType=${searchParams.matchType}` : ''}`}
                    className="btn-secondary"
                  >
                    Next →
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}