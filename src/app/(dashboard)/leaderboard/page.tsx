import { getCurrentUser } from '@/actions/user';
import { getOrganizationLeaderboard, getOrganizationsForLeaderboard } from '@/actions/leaderboard';
import { formatUserDisplayName } from '@/lib/utils';
import { redirect } from 'next/navigation';
import OrganizationSelectorClient from '@/components/OrganizationSelectorClient';

interface LeaderboardPageProps {
  searchParams: {
    org?: string;
  };
}

export default async function LeaderboardPage({ searchParams }: LeaderboardPageProps) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/sign-in');
  }
  
  const organizations = await getOrganizationsForLeaderboard();
  
  // Use org from query params or user's organization
  const selectedOrgId = searchParams.org || user.organizationId;
  
  const leaderboard = selectedOrgId
    ? await getOrganizationLeaderboard(selectedOrgId)
    : [];
  
  const selectedOrg = organizations.find(o => o.id === selectedOrgId);
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Leaderboard</h1>
      
      {/* Organization Selector */}
      <div className="card">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Organization
        </label>
        <OrganizationSelectorClient
          organizations={organizations}
          selectedOrgId={selectedOrgId}
        />
      </div>
      
      {/* Leaderboard */}
      {selectedOrg && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">
            {selectedOrg.name} Rankings
          </h2>
          
          {leaderboard.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-4xl mb-2">🏆</p>
              <p>No players in this organization yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((player, index) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    player.id === user.id
                      ? 'bg-primary-50 border-primary-200'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl font-bold text-gray-400 w-8 text-center">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && `#${index + 1}`}
                    </div>
                    <div>
                      <div className="font-medium flex items-center space-x-2">
                        <span>{formatUserDisplayName(player.name, player.userNumber)}</span>
                        {player.id === user.id && (
                          <span className="text-xs bg-primary-100 text-primary-800 px-2 py-0.5 rounded">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {player.preferredGameType} • {player.location}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-600">
                      {player.rating}
                    </div>
                    <div className="text-sm text-gray-600">
                      {player.winCount}W - {player.lossCount}L
                    </div>
                    {(player.winCount + player.lossCount > 0) && (
                      <div className="text-xs text-gray-500">
                        {((player.winCount / (player.winCount + player.lossCount)) * 100).toFixed(1)}% WR
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
