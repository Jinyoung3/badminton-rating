import { getCurrentUser } from '@/actions/user';
import CreateEventForm from './CreateEventForm';
import { redirect } from 'next/navigation';

export default async function CreateEventPage() {
  const user = await getCurrentUser();
  
  if (!user || !user.organization) {
    redirect('/dashboard');
  }
  
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Event</h1>
        <p className="text-gray-600 mt-2">
          Organize a badminton tournament or practice session
        </p>
      </div>
      
      <CreateEventForm organizationId={user.organizationId!} organizationName={user.organization.name} />
    </div>
  );
}
