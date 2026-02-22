'use client';

import { useRouter } from 'next/navigation';
import CreateOrganizationForm from '@/components/CreateOrganizationForm';
import { switchOrganization } from '@/actions/user';

export default function CreateOrganizationPageClient() {
  const router = useRouter();

  const handleSuccess = async (organizationId: string) => {
    await switchOrganization(organizationId);
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <CreateOrganizationForm
      onSuccess={handleSuccess}
      onCancel={() => router.push('/dashboard')}
    />
  );
}
