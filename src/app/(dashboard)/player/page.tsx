import { searchPlayers } from '@/actions/player';
import PlayerSearchForm from '@/components/PlayerSearchForm';
import PlayerCard from '@/components/PlayerCard';

export const dynamic = 'force-dynamic';

interface PlayerPageProps {
  searchParams: {
    query?: string;
    location?: string;
    minRating?: string;
    maxRating?: string;
    gameType?: string;
  };
}

export default async function PlayerPage({ searchParams }: PlayerPageProps) {
  const players = await searchPlayers({
    query: searchParams.query,
    location: searchParams.location,
    minRating: searchParams.minRating ? parseInt(searchParams.minRating) : undefined,
    maxRating: searchParams.maxRating ? parseInt(searchParams.maxRating) : undefined,
    preferredGameType: searchParams.gameType,
    limit: 20,
  });

  const hasFilters =
    !!searchParams.query ||
    !!searchParams.location ||
    !!searchParams.minRating ||
    !!searchParams.maxRating ||
    !!searchParams.gameType;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🔍 Find Players</h1>
        <p className="text-gray-600 mt-2">
          Search for players by name, location, rating, or game type
        </p>
      </div>

      <PlayerSearchForm initialParams={searchParams} />

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {hasFilters ? `Search Results (${players.length})` : `Players (${players.length})`}
          </h2>
        </div>

        {players.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-4xl mb-2">😕</p>
            <p className="text-gray-600">
              {hasFilters ? 'No players found' : 'No players yet'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {hasFilters ? 'Try adjusting your search filters' : 'Complete your profile to appear here'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}