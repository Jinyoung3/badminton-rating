import { getCurrentUser } from '@/actions/user';
import { redirect } from 'next/navigation';
import EditProfileForm from '@/components/EditProfileForm';

export default async function EditProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">✏️ Edit Profile</h1>
        <p className="text-gray-600 mt-2">
          Update your profile information and self-rating
        </p>
      </div>

      <EditProfileForm user={user} />
    </div>
  );
}