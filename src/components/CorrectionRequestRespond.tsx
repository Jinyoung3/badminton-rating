'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { approveCorrectionRequest, rejectCorrectionRequest } from '@/actions/corrections';

interface CorrectionRequestRespondProps {
  requestId: string;
  proposedGamesDisplay: string;
  reason: string;
  requesterName: string;
}

export default function CorrectionRequestRespond({
  requestId,
  proposedGamesDisplay,
  reason,
  requesterName,
}: CorrectionRequestRespondProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<'accept' | 'reject' | null>(null);
  const [error, setError] = useState('');

  const handleAccept = async () => {
    setLoading('accept');
    setError('');
    const result = await approveCorrectionRequest(requestId);
    if (result.success) {
      router.refresh();
    } else {
      setError(result.error || 'Failed to accept');
    }
    setLoading(null);
  };

  const handleReject = async () => {
    setLoading('reject');
    setError('');
    const result = await rejectCorrectionRequest(requestId);
    if (result.success) {
      router.refresh();
    } else {
      setError(result.error || 'Failed to reject');
    }
    setLoading(null);
  };

  return (
    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
      <div className="text-sm text-gray-700">
        <strong>{requesterName}</strong> requested a score correction.
      </div>
      <div className="text-sm text-gray-600">
        Proposed score (games): <span className="font-mono">{proposedGamesDisplay}</span>
      </div>
      <div className="text-sm text-gray-600">Reason: {reason}</div>
      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}
      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={handleAccept}
          disabled={loading !== null}
          className="btn-primary text-sm"
        >
          {loading === 'accept' ? 'Accepting...' : 'Accept'}
        </button>
        <button
          type="button"
          onClick={handleReject}
          disabled={loading !== null}
          className="btn-secondary text-sm"
        >
          {loading === 'reject' ? 'Rejecting...' : 'Reject'}
        </button>
      </div>
    </div>
  );
}
