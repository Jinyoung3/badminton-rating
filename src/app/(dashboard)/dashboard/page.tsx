import { getCurrentUser } from '@/actions/user';
import { getRecentMatches } from '@/actions/matches';
import { formatUserDisplayName } from '@/lib/utils';
import Link from 'next/link';
import MatchCard from '@/components/MatchCard';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const recentMatches = await getRecentMatches(10);

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user.name}! 🏸
        </h1>
        <p className="text-primary-100 mb-4">
          {formatUserDisplayName(user.name, user.userNumber)} • {user.organization?.name}
        </p>
        <div className="flex items-center space-x-8 mt-6">
          <div>
            <div className="text-4xl font-bold">{user.rating}</div>
            <div className="text-sm text-primary-100">Current Rating</div>
          </div>
          <div>
            <div className="text-4xl font-bold">{user.winCount}</div>
            <div className="text-sm text-primary-100">Wins</div>
          </div>
          <div>
            <div className="text-4xl font-bold">{user.lossCount}</div>
            <div className="text-sm text-primary-100">Losses</div>
          </div>
          <div>
            <div className="text-4xl font-bold">
              {user.winCount + user.lossCount > 0 
                ? ((user.winCount / (user.winCount + user.lossCount)) * 100).toFixed(1)
                : '0.0'}%
            </div>
            <div className="text-sm text-primary-100">Win Rate</div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/record/challenge"
          className="card hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">⚔️</div>
          <h3 className="font-semibold text-lg mb-1">Record Challenge Match</h3>
          <p className="text-sm text-gray-600">Record a casual match with friends</p>
        </Link>
        
        <Link
          href="/event"
          className="card hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🏆</div>
          <h3 className="font-semibold text-lg mb-1">Event</h3>
          <p className="text-sm text-gray-600">Find events and create your own tournament</p>
        </Link>
        
        <Link
          href="/organization"
          className="card hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🏢</div>
          <h3 className="font-semibold text-lg mb-1">Organization</h3>
          <p className="text-sm text-gray-600">View organizations and switch or create one</p>
        </Link>
        
        <Link
          href="/player"
          className="card hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🔍</div>
          <h3 className="font-semibold text-lg mb-1">Find Players</h3>
          <p className="text-sm text-gray-600">Search for opponents and teammates</p>
        </Link>
      </div>
      
      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        {recentMatches.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-4xl mb-2">📊</p>
            <p>No recent matches or events</p>
            <p className="text-sm mt-1">Start by recording a match or joining an event!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentMatches.map((match) => (
              <MatchCard key={match.id} match={match} userId={user.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
