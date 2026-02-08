'use client';

import { useState } from 'react';
import { removeParticipant, markParticipantAbsent } from '@/actions/event';
import { useRouter } from 'next/navigation';

interface ParticipantActionsProps {
  eventId: string;
  participantId: string;
  isAbsent: boolean;
}

export default function ParticipantActions({
  eventId,
  participantId,
  isAbsent,
}: ParticipantActionsProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleToggleAbsent = async () => {
    setIsUpdating(true);
    
    const result = await markParticipantAbsent(eventId, participantId, !isAbsent);
    
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || 'Failed to update attendance');
    }
    
    setIsUpdating(false);
  };
  
  const handleRemove = async () => {
    if (!confirm('Are you sure you want to remove this participant?')) {
      return;
    }
    
    setIsUpdating(true);
    
    const result = await removeParticipant(eventId, participantId);
    
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || 'Failed to remove participant');
      setIsUpdating(false);
    }
  };
  
  return (
    <div className="flex gap-2">
      <button
        onClick={handleToggleAbsent}
        disabled={isUpdating}
        className="text-sm px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
      >
        {isAbsent ? 'Mark Present' : 'Mark Absent'}
      </button>
      <button
        onClick={handleRemove}
        disabled={isUpdating}
        className="text-sm px-3 py-1 rounded border border-red-300 text-red-600 hover:bg-red-50"
      >
        Remove
      </button>
    </div>
  );
}
