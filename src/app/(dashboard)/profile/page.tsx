import { getCurrentUser } from '@/actions/user';
import { getMatchStatistics } from '@/actions/matches';
import { redirect } from 'next/navigation';
import { formatUserDisplayName } from '@/lib/utils';
import Link from 'next/link';

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  const stats = await getMatchStatistics(user.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-gray-600 mt-2">View and manage your profile information</p>
        </div>
        <Link href="/profile/edit" className="btn-primary">
          ✏️ Edit Profile
        </Link>
      </div>

      {/* Basic Info Card */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">Basic Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-gray-500">Display Name</label>
            <div className="text-lg font-semibold">
              {formatUserDisplayName(user.name, user.userNumber)}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-500">Email</label>
            <div className="text-lg font-semibold">{user.email}</div>
          </div>

          <div>
            <label className="text-sm text-gray-500">Location</label>
            <div className="text-lg font-semibold">{user.location}</div>
          </div>

          <div>
            <label className="text-sm text-gray-500">Sex</label>
            <div className="text-lg font-semibold">{user.sex}</div>
          </div>

          <div>
            <label className="text-sm text-gray-500">Preferred Game Type</label>
            <div className="text-lg font-semibold">{user.preferredGameType}</div>
          </div>

          <div>
            <label className="text-sm text-gray-500">Organization</label>
            <div className="text-lg font-semibold">
              {user.organization?.name || 'No organization'}
            </div>
          </div>
        </div>
      </div>

      {/* Rating Card */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">Current Rating</h2>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="text-5xl font-bold text-primary-600">{user.rating}</div>
            <div className="text-sm text-gray-500 mt-1">Current Rating</div>
          </div>
          <Link href="/profile/edit#self-rating" className="btn-secondary">
            Update Self-Rating
          </Link>
        </div>
      </div>

      {/* Statistics Card */}
      {stats && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Match Statistics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold">{stats.overall.total}</div>
              <div className="text-sm text-gray-600">Total Matches</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{stats.overall.wins}</div>
              <div className="text-sm text-gray-600">Wins</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-3xl font-bold text-red-600">{stats.overall.losses}</div>
              <div className="text-sm text-gray-600">Losses</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Singles Stats */}
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-3">🎾 Singles</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Matches</span>
                  <span className="font-semibold">{stats.singles.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Record</span>
                  <span className="font-semibold">{stats.singles.wins}W - {stats.singles.losses}L</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Win Rate</span>
                  <span className="font-bold text-primary-600">{stats.singles.winRate}%</span>
                </div>
              </div>
            </div>

            {/* Doubles Stats */}
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-3">👥 Doubles</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Matches</span>
                  <span className="font-semibold">{stats.doubles.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Record</span>
                  <span className="font-semibold">{stats.doubles.wins}W - {stats.doubles.losses}L</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Win Rate</span>
                  <span className="font-bold text-primary-600">{stats.doubles.winRate}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <h3 className="font-semibold mb-3">Match Breakdown</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.byType.event}</div>
                <div className="text-xs text-gray-600">Event Matches</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{stats.byType.challenge}</div>
                <div className="text-xs text-gray-600">Challenge Matches</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">{stats.byType.practice}</div>
                <div className="text-xs text-gray-600">Practice Matches</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Self-Rating Card */}
      {user.selfRating && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Self-Rating Assessment</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Grip & Footwork', value: user.selfRating.question1 },
              { label: 'Rally Consistency', value: user.selfRating.question2 },
              { label: 'Shot Placement', value: user.selfRating.question3 },
              { label: 'Overhead Technique', value: user.selfRating.question4 },
              { label: 'Court Movement', value: user.selfRating.question5 },
              { label: 'Match Strategy', value: user.selfRating.question6 },
              { label: 'Competitive Experience', value: user.selfRating.question7 },
              { label: 'Teaching Ability', value: user.selfRating.question8 },
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
    </div>
  );
}