'use client';

import { formatUserDisplayName } from '@/lib/utils';

interface Player {
  id: string;
  name: string;
  userNumber: number;
  rating: number;
  location: string;
  preferredGameType: string;
  winCount: number;
  lossCount: number;
  organization: {
    name: string;
  } | null;
}

interface PlayerCardProps {
  player: Player;
}

export default function PlayerCard({ player }: PlayerCardProps) {
  const totalMatches = player.winCount + player.lossCount;
  const winRate = totalMatches > 0 
    ? ((player.winCount / totalMatches) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="card">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg">
            {formatUserDisplayName(player.name, player.userNumber)}
          </h3>
          {player.organization && (
            <p className="text-sm text-gray-600">{player.organization.name}</p>
          )}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary-600">{player.rating}</div>
          <div className="text-xs text-gray-500">Rating</div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
        <span>📍 {player.location}</span>
        <span>{player.preferredGameType}</span>
      </div>

      <div className="flex items-center justify-between text-sm pt-2 border-t">
        <span className="text-gray-600">
          {player.winCount}W - {player.lossCount}L
        </span>
        <span className="font-semibold text-primary-600">
          {winRate}% WR
        </span>
      </div>
    </div>
  );
}
