'use client';

import { useState } from 'react';
import { leaveEvent } from '@/actions/event';
import { useRouter } from 'next/navigation';

interface LeaveEventButtonProps {
  eventId: string;
}

export default function LeaveEventButton({ eventId }: LeaveEventButtonProps) {
  const router = useRouter();
  const [isLeaving, setIsLeaving] = useState(false);
  
  const handleLeave = async () => {
    if (!confirm('Are you sure you want to leave this event?')) {
      return;
    }
    
    setIsLeaving(true);
    
    const result = await leaveEvent(eventId);
    
    if (result.success) {
      router.push('/event');
    } else {
      alert(result.error || 'Failed to leave event');
      setIsLeaving(false);
    }
  };
  
  return (
    <button
      onClick={handleLeave}
      disabled={isLeaving}
      className="btn-danger w-full"
    >
      {isLeaving ? 'Leaving...' : 'Leave Event'}
    </button>
  );
}
