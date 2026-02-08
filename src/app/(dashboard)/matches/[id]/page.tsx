import { getMatchById } from '@/actions/matches';
import { notFound } from 'next/navigation';
import { formatUserDisplayName } from '@/lib/utils';
import Link from 'next/link';

interface MatchDetailPageProps {
  params: {
    id: string;
  };
}

export default async function MatchDetailPage({ params }: MatchDetailPageProps) {
  const match = await getMatchById(params.id);

  if (!match) {
    notFound();
  }

  const games = match.games as Array<{ team1: number; team2: number }>;
  const team1Games = games.filter(g => g.team1 > g.team2).length;
  const team2Games = games.filter(g => g.team2 > g.team1).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold">Match Details</h1>
            <p className="text-gray-600 mt-1">
              {new Date(match.matchDate).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-3 py-1 rounded ${
              match.type === 'event' ? 'bg-blue-100 text-blue-800' :
              match.type === 'challenge' ? 'bg-purple-100 text-purple-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {match.type}
            </span>
            <span className="text-xs px-3 py-1 rounded bg-gray-100 text-gray-800">
              {match.gameType}
            </span>
          </div>
        </div>

        {match.event && (
          <div className="p-3 bg-blue-50 rounded-lg mb-4">
            <div className="text-sm font-medium text-blue-900">
              📅 Event: {match.event.name}
            </div>
            <div className="text-xs text-blue-700">
              {match.event.organization.name}
            </div>
          </div>
        )}
      </div>

      {/* Match Result */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">Final Score</h2>
        
        <div className="space-y-4">
          {/* Team 1 */}
          <div className={`p-4 rounded-lg ${
            match.winner === 'team1' ? 'bg-green-50 border-2 border-green-500' : 'bg-gray-50'
          }`}>
            <div className="flex justify-between items-center">
              <div>
                {match.winner === 'team1' && (
                  <span className="text-xs font-bold text-green-600 mb-1 block">WINNER</span>
                )}
                <div className="text-lg font-bold">
                  {formatUserDisplayName(match.player1.name, match.player1.userNumber)}
                  {match.player2 && match.gameType === 'doubles' && (
                    <> & {formatUserDisplayName(match.player2.name, match.player2.userNumber)}</>
                  )}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Rating: {match.player1.rating}
                  {match.player2 && match.gameType === 'doubles' && ` / ${match.player2.rating}`}
                </div>
                {match.player1.organization && (
                  <div className="text-xs text-gray-500 mt-1">
                    {match.player1.organization.name}
                  </div>
                )}
              </div>
              <div className="text-4xl font-bold">{team1Games}</div>
            </div>
          </div>

          {/* Team 2 */}
          <div className={`p-4 rounded-lg ${
            match.winner === 'team2' ? 'bg-green-50 border-2 border-green-500' : 'bg-gray-50'
          }`}>
            <div className="flex justify-between items-center">
              <div>
                {match.winner === 'team2' && (
                  <span className="text-xs font-bold text-green-600 mb-1 block">WINNER</span>
                )}
                <div className="text-lg font-bold">
                  {match.gameType === 'singles'
                    ? formatUserDisplayName(match.player2.name, match.player2.userNumber)
                    : match.player3 && match.player4
                      ? `${formatUserDisplayName(match.player3.name, match.player3.userNumber)} & ${formatUserDisplayName(match.player4.name, match.player4.userNumber)}`
                      : 'Unknown'
                  }
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Rating: {match.gameType === 'singles'
                    ? match.player2.rating
                    : match.player3 && match.player4
                      ? `${match.player3.rating} / ${match.player4.rating}`
                      : 'N/A'
                  }
                </div>
                {match.player2.organization && (
                  <div className="text-xs text-gray-500 mt-1">
                    {match.player2.organization.name}
                  </div>
                )}
              </div>
              <div className="text-4xl font-bold">{team2Games}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Game-by-Game Scores */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">Game Scores</h2>
        
        <div className="space-y-3">
          {games.map((game, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="font-semibold text-gray-700">Game {index + 1}</span>
              <div className="flex items-center gap-4">
                <span className={`text-2xl font-bold ${game.team1 > game.team2 ? 'text-green-600' : 'text-gray-600'}`}>
                  {game.team1}
                </span>
                <span className="text-gray-400">-</span>
                <span className={`text-2xl font-bold ${game.team2 > game.team1 ? 'text-green-600' : 'text-gray-600'}`}>
                  {game.team2}
                </span>
              </div>
              <span className="text-sm text-gray-500 w-20 text-right">
                {game.team1 > game.team2 ? 'Team 1' : 'Team 2'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Correction Requests */}
      {match.scoreCorrectionRequests && match.scoreCorrectionRequests.length > 0 && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Score Correction Requests</h2>
          <div className="space-y-3">
            {match.scoreCorrectionRequests.map((request: any) => (
              <div key={request.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-medium text-yellow-800">
                    {request.status.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-600">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-sm text-gray-700">
                  Requested by: {formatUserDisplayName(request.requester.name, request.requester.userNumber)}
                </div>
                <div className="text-sm text-gray-600 mt-1">{request.reason}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Back Button */}
      <Link href="/matches" className="btn-secondary inline-block">
        ← Back to Matches
      </Link>
    </div>
  );
}