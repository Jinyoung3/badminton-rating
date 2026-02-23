import { getCurrentUser } from '@/actions/user';
import { getRecentMatchesPage } from '@/actions/matches';
import { formatUserDisplayName } from '@/lib/utils';
import Link from 'next/link';
import RecentActivityList from '@/components/RecentActivityList';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const recentMatches = await getRecentMatchesPage(5, 0);

  if (!user) {
    return null;
  }

  const totalMatches =
    ((user as any).winCountSingles ?? 0) +
    ((user as any).lossCountSingles ?? 0) +
    ((user as any).winCountDoubles ?? 0) +
    ((user as any).lossCountDoubles ?? 0);
  const isNewUser = totalMatches === 0;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          {isNewUser ? `Welcome, ${user.name}!` : `Welcome back, ${user.name}!`} 🏸
        </h1>
        <p className="text-primary-100 mb-4">
          {formatUserDisplayName(user.name, user.userNumber)} • {user.organization?.name}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
          <div>
            <div className="text-3xl font-bold">{(user as any).ratingSingles ?? user.rating}</div>
            <div className="text-sm text-primary-100">Singles Rating</div>
            <div className="text-xs text-primary-200 mt-1">
              {(user as any).winCountSingles ?? 0}W - {(user as any).lossCountSingles ?? 0}L
              {((user as any).winCountSingles ?? 0) + ((user as any).lossCountSingles ?? 0) > 0 && (
                <span className="ml-1">
                  ({(((user as any).winCountSingles ?? 0) / (((user as any).winCountSingles ?? 0) + ((user as any).lossCountSingles ?? 0)) * 100).toFixed(0)}%)
                </span>
              )}
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold">{(user as any).ratingDoubles ?? user.rating}</div>
            <div className="text-sm text-primary-100">Doubles Rating</div>
            <div className="text-xs text-primary-200 mt-1">
              {(user as any).winCountDoubles ?? 0}W - {(user as any).lossCountDoubles ?? 0}L
              {((user as any).winCountDoubles ?? 0) + ((user as any).lossCountDoubles ?? 0) > 0 && (
                <span className="ml-1">
                  ({(((user as any).winCountDoubles ?? 0) / (((user as any).winCountDoubles ?? 0) + ((user as any).lossCountDoubles ?? 0)) * 100).toFixed(0)}%)
                </span>
              )}
            </div>
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
        <RecentActivityList initialMatches={recentMatches} userId={user.id} />
      </div>
    </div>
  );
}
