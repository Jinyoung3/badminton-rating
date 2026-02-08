'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface Organization {
  id: string;
  name: string;
  _count: {
    members: number;
  };
}

interface OrganizationSelectorProps {
  organizations: Organization[];
  selectedOrgId: string | null;
}

export default function OrganizationSelectorClient({
  organizations,
  selectedOrgId,
}: OrganizationSelectorProps) {
  const router = useRouter();
  
  const handleChange = (orgId: string) => {
    router.push(`/leaderboard?org=${orgId}`);
  };
  
  return (
    <select
      value={selectedOrgId || ''}
      onChange={(e) => handleChange(e.target.value)}
      className="input-field max-w-md"
    >
      {organizations.map((org) => (
        <option key={org.id} value={org.id}>
          {org.name} ({org._count.members} members)
        </option>
      ))}
    </select>
  );
}
