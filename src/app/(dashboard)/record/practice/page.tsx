import { getCurrentUser } from '@/actions/user';
import { getAllUsers } from '@/actions/match';
import { redirect } from 'next/navigation';
import RecordMatchForm from '@/components/RecordMatchForm';

export default async function RecordPracticePage() {
  const user = await getCurrentUser();
  const allUsers = await getAllUsers();
  
  if (!user) {
    redirect('/sign-in');
  }
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🏸 Record Practice Match</h1>
        <p className="text-gray-600 mt-2">
          Record a practice session. Ratings will NOT be affected.
        </p>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-900 font-medium mb-1">
          ⚠️ Practice Mode
        </p>
        <p className="text-sm text-yellow-700">
          This match will be recorded for tracking purposes only. Player ratings and win/loss records will not change.
        </p>
      </div>
      
      <RecordMatchForm
        allUsers={allUsers}
        isPractice={true}
      />
    </div>
  );
}
