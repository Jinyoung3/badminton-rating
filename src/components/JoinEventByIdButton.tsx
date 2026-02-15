'use client';

import { useState } from 'react';
import { joinEventById } from '@/actions/event';
import { useRouter } from 'next/navigation';

interface JoinEventByIdButtonProps {
  eventId: string;
}

export default function JoinEventByIdButton({ eventId }: JoinEventByIdButtonProps) {
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError('');
    setIsJoining(true);
    const result = await joinEventById(eventId);
    if (result.success) {
      router.refresh();
    } else {
      setError(result.error || 'Failed to join event');
    }
    setIsJoining(false);
  };

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={isJoining}
        className="btn-primary text-sm w-full sm:w-auto"
      >
        {isJoining ? 'Joining...' : 'Join'}
      </button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
