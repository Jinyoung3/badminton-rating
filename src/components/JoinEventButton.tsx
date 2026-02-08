'use client';

import { useState } from 'react';
import { joinEvent } from '@/actions/event';
import { useRouter } from 'next/navigation';

export default function JoinEventButton() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code.length !== 4) {
      alert('Event code must be 4 digits');
      return;
    }
    
    setIsJoining(true);
    
    const result = await joinEvent(code);
    
    if (result.success && result.event) {
      router.push(`/event/${result.event.id}`);
    } else {
      alert(result.error || 'Failed to join event');
      setIsJoining(false);
    }
  };
  
  return (
    <form onSubmit={handleJoin} className="flex gap-2">
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
        placeholder="1234"
        className="input-field font-mono text-lg tracking-widest max-w-[120px]"
        maxLength={4}
        required
      />
      <button
        type="submit"
        disabled={isJoining || code.length !== 4}
        className="btn-primary"
      >
        {isJoining ? 'Joining...' : 'Join Event'}
      </button>
    </form>
  );
}
