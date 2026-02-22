'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { switchOrganization } from '@/actions/user';

interface SwitchOrganizationButtonProps {
  organizationId: string;
  organizationName: string;
  isCurrent: boolean;
}

export default function SwitchOrganizationButton({
  organizationId,
  organizationName,
  isCurrent,
}: SwitchOrganizationButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSwitch = async () => {
    if (isCurrent) return;
    setIsLoading(true);
    try {
      const result = await switchOrganization(organizationId);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || 'Failed to switch organization');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isCurrent) {
    return (
      <span className="text-sm text-primary-600 font-medium">Current</span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleSwitch}
      disabled={isLoading}
      className="btn-secondary text-sm py-1.5 px-3"
    >
      {isLoading ? 'Switching...' : 'Switch here'}
    </button>
  );
}
