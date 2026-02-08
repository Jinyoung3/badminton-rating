import { getCurrentUser } from '@/actions/user';
import { getAllUsers } from '@/actions/match';
import { redirect } from 'next/navigation';
import RecordMatchForm from '@/components/RecordMatchForm';

export default async function RecordChallengePage() {
  const user = await getCurrentUser();
  const allUsers = await getAllUsers();
  
  if (!user) {
    redirect('/sign-in');
  }
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">⚔️ Record Challenge Match</h1>
        <p className="text-gray-600 mt-2">
          Record a casual match. Ratings will be updated automatically.
        </p>
      </div>
      
      <RecordMatchForm
        allUsers={allUsers}
        isPractice={false}
      />
    </div>
  );
}
