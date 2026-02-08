import { getPlayerProfile } from '@/actions/player';
import { notFound } from 'next/navigation';
import { formatUserDisplayName } from '@/lib/utils';
import Link from 'next/link';
import MatchCard from '@/components/MatchCard';

interface PlayerProfilePageProps {
  params: {
    id: string;
  };
}

export default async function PlayerProfilePage({ params }: PlayerProfilePageProps) {
  const playerData = await getPlayerProfile(params.id);

  if (!playerData) {
    notFound();
  }

  const { recentMatches, stats, ...player } = playerData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">
              {formatUserDisplayName(player.name, player.userNumber)}
            </h1>
            {player.organization && (
              <p className="text-gray-600 mt-1">{player.organization.name}</p>
            )}
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-primary-600">{player.rating}</div>
            <div className="text-sm text-gray-500">Rating</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{player.winCount}</div>
            <div className="text-xs text-gray-600">Total Wins</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{player.lossCount}</div>
            <div className="text-xs text-gray-600">Total Losses</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {player.winCount + player.lossCount > 0
                ? ((player.winCount / (player.winCount + player.lossCount)) * 100).toFixed(1)
                : '0.0'}%
            </div>
            <div className="text-xs text-gray-600">Win Rate</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{stats.totalMatches}</div>
            <div className="text-xs text-gray-600">Total Matches</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
          <div>
            <div className="text-sm font-medium text-gray-500">Location</div>
            <div className="text-base font-medium">{player.location}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Preferred Game</div>
            <div className="text-base font-medium">{player.preferredGameType}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Sex</div>
            <div className="text-base font-medium">{player.sex}</div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Singles Record */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">🎾 Singles Record</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Matches Played</span>
              <span className="font-semibold">{stats.singlesRecord.wins + stats.singlesRecord.losses}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Wins</span>
              <span className="font-semibold text-green-600">{stats.singlesRecord.wins}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Losses</span>
              <span className="font-semibold text-red-600">{stats.singlesRecord.losses}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-gray-600">Win Rate</span>
              <span className="font-bold text-primary-600">{stats.singlesRecord.winRate}%</span>
            </div>
          </div>
        </div>

        {/* Doubles Record */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">👥 Doubles Record</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Matches Played</span>
              <span className="font-semibold">{stats.doublesRecord.wins + stats.doublesRecord.losses}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Wins</span>
              <span className="font-semibold text-green-600">{stats.doublesRecord.wins}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Losses</span>
              <span className="font-semibold text-red-600">{stats.doublesRecord.losses}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-gray-600">Win Rate</span>
              <span className="font-bold text-primary-600">{stats.doublesRecord.winRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Self-Rating */}
      {player.selfRating && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">📊 Self-Rating Assessment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Grip & Footwork', value: player.selfRating.question1 },
              { label: 'Rally Consistency', value: player.selfRating.question2 },
              { label: 'Shot Placement', value: player.selfRating.question3 },
              { label: 'Overhead Technique', value: player.selfRating.question4 },
              { label: 'Court Movement', value: player.selfRating.question5 },
              { label: 'Match Strategy', value: player.selfRating.question6 },
              { label: 'Competitive Experience', value: player.selfRating.question7 },
              { label: 'Teaching Ability', value: player.selfRating.question8 },
            ].map((item, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span className="text-lg font-bold text-primary-600">{item.value}/10</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full"
                    style={{ width: `${(item.value / 10) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Matches */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">📜 Recent Matches</h2>
        {recentMatches.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-4xl mb-2">🏸</p>
            <p>No matches played yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentMatches.map((match: any) => (
              <MatchCard key={match.id} match={match} userId={player.id} />
            ))}
          </div>
        )}
      </div>

      {/* Back Button */}
      <Link href="/player" className="btn-secondary inline-block">
        ← Back to Search
      </Link>
    </div>
  );
}