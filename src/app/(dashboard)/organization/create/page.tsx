import CreateOrganizationPageClient from './CreateOrganizationPageClient';

export default function CreateOrganizationPage() {
  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Organization</h1>
      <p className="text-gray-600 mb-6">
        Add a new club or college to organize events and track ratings.
      </p>
      <CreateOrganizationPageClient />
    </div>
  );
}
