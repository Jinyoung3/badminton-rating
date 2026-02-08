'use client';

import Link from 'next/link';
import { formatUserDisplayName } from '@/lib/utils';

interface Match {
  id: string;
  type: string;
  gameType: string;
  winner: string;
  games: any;
  matchDate: Date;
  player1: {
    id: string;
    name: string;
    userNumber: number;
    rating: number;
  };
  player2: {
    id: string;
    name: string;
    userNumber: number;
    rating: number;
  };
  player3?: {
    id: string;
    name: string;
    userNumber: number;
    rating: number;
  } | null;
  player4?: {
    id: string;
    name: string;
    userNumber: number;
    rating: number;
  } | null;
  event?: {
    id: string;
    name: string;
  } | null;
}

interface MatchCardProps {
  match: Match;
  userId?: string; // Current user ID to highlight their result
}

export default function MatchCard({ match, userId }: MatchCardProps) {
  // Determine if current user won
  let userWon: boolean | null = null;
  if (userId) {
    const isTeam1 = match.player1.id === userId || match.player2?.id === userId;
    userWon = (isTeam1 && match.winner === 'team1') || (!isTeam1 && match.winner === 'team2');
  }

  // Parse games for score display
  const games = match.games as Array<{ team1: number; team2: number }>;
  const team1Games = games.filter(g => g.team1 > g.team2).length;
  const team2Games = games.filter(g => g.team2 > g.team1).length;

  // Get badge colors
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'event': return 'bg-blue-100 text-blue-800';
      case 'challenge': return 'bg-purple-100 text-purple-800';
      case 'practice': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Link 
      href={`/matches/${match.id}`}
      className={`card hover:shadow-md transition-shadow cursor-pointer ${
        userWon !== null ? (userWon ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500') : ''
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded ${getTypeColor(match.type)}`}>
            {match.type}
          </span>
          <span className="text-xs text-gray-600">
            {match.gameType}
          </span>
          {userWon !== null && (
            <span className={`text-xs font-semibold ${userWon ? 'text-green-600' : 'text-red-600'}`}>
              {userWon ? 'WIN' : 'LOSS'}
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500">
          {new Date(match.matchDate).toLocaleDateString()}
        </span>
      </div>

      {/* Teams */}
      <div className="space-y-2">
        {/* Team 1 */}
        <div className={`p-2 rounded ${match.winner === 'team1' ? 'bg-green-50' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">
                {formatUserDisplayName(match.player1.name, match.player1.userNumber)}
                {match.player2 && match.gameType === 'doubles' && (
                  <> & {formatUserDisplayName(match.player2.name, match.player2.userNumber)}</>
                )}
              </div>
              <div className="text-xs text-gray-600">
                Rating: {match.player1.rating}
                {match.player2 && match.gameType === 'doubles' && ` / ${match.player2.rating}`}
              </div>
            </div>
            <div className="text-xl font-bold">
              {team1Games}
            </div>
          </div>
        </div>

        {/* Team 2 */}
        <div className={`p-2 rounded ${match.winner === 'team2' ? 'bg-green-50' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">
                {match.gameType === 'singles' 
                  ? formatUserDisplayName(match.player2.name, match.player2.userNumber)
                  : match.player3 && match.player4 
                    ? `${formatUserDisplayName(match.player3.name, match.player3.userNumber)} & ${formatUserDisplayName(match.player4.name, match.player4.userNumber)}`
                    : 'Unknown'
                }
              </div>
              <div className="text-xs text-gray-600">
                Rating: {match.gameType === 'singles' 
                  ? match.player2.rating 
                  : match.player3 && match.player4 
                    ? `${match.player3.rating} / ${match.player4.rating}`
                    : 'N/A'
                }
              </div>
            </div>
            <div className="text-xl font-bold">
              {team2Games}
            </div>
          </div>
        </div>
      </div>

      {/* Game Scores */}
      <div className="mt-3 pt-3 border-t">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span>Games:</span>
          {games.map((game, index) => (
            <span key={index} className="font-mono">
              {game.team1}-{game.team2}
            </span>
          ))}
        </div>
        {match.event && (
          <div className="text-xs text-gray-500 mt-1">
            📅 {match.event.name}
          </div>
        )}
      </div>
    </Link>
  );
}