import { getCurrentUser } from '@/actions/user';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function RecordPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/sign-in');
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Record Match</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Challenge Match */}
        <Link
          href="/record/challenge"
          className="card hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">⚔️</div>
          <h2 className="text-2xl font-bold mb-2">Challenge Match</h2>
          <p className="text-gray-600 mb-4">
            Record a casual match with friends. Affects player ratings.
          </p>
          <div className="text-sm text-gray-500">
            • Select any players
            <br />
            • Singles or Doubles
            <br />
            • Ratings updated automatically
          </div>
        </Link>
        
        {/* Practice Match */}
        <Link
          href="/record/practice"
          className="card hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🏸</div>
          <h2 className="text-2xl font-bold mb-2">Practice Match</h2>
          <p className="text-gray-600 mb-4">
            Record a practice session. Does not affect ratings.
          </p>
          <div className="text-sm text-gray-500">
            • For training purposes
            <br />
            • No rating changes
            <br />
            • Track improvement over time
          </div>
        </Link>
      </div>
      
      {/* Event Matches */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">📅 Event Matches</h2>
        <p className="text-gray-600 mb-4">
          To record matches during an event, go to the event page. Only the event creator can record scores.
        </p>
        <Link href="/event" className="btn-primary inline-block">
          Go to Events
        </Link>
      </div>
    </div>
  );
}
