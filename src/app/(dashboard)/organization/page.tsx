import { getCurrentUser } from '@/actions/user';
import { getAllOrganizations } from '@/actions/organization';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import SwitchOrganizationButton from '@/components/SwitchOrganizationButton';

export default async function OrganizationListPage() {
  const user = await getCurrentUser();
  const organizations = await getAllOrganizations();

  if (!user) {
    redirect('/sign-in');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Organizations</h1>
        <Link href="/organization/create" className="btn-primary">
          + Create Organization
        </Link>
      </div>

      <p className="text-gray-600">
        Switch to a different organization to see its events and leaderboard. You can only be in one organization at a time.
      </p>

      {/* Organization list */}
      {organizations.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-2">🏢</p>
          <p className="text-gray-600">No organizations yet</p>
          <p className="text-sm text-gray-500 mt-1">Create one to get started</p>
          <Link href="/organization/create" className="btn-primary mt-4 inline-block">
            Create Organization
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {organizations.map((org) => (
            <div
              key={org.id}
              className="card flex flex-col justify-between"
            >
              <div>
                <h3 className="font-bold text-lg">{org.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {org.type} {org.location && `• ${org.location}`}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {org._count.members} member{org._count.members !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <SwitchOrganizationButton
                  organizationId={org.id}
                  organizationName={org.name}
                  isCurrent={user.organizationId === org.id}
                />
                <Link
                  href={`/leaderboard?org=${org.id}`}
                  className="text-sm text-primary-600 hover:underline"
                >
                  View leaderboard
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
