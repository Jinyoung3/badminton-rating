'use client';

import { useState } from 'react';
import { approveCorrectionRequest, rejectCorrectionRequest } from '@/actions/corrections';
import { formatUserDisplayName } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface CorrectionRequest {
  id: string;
  reason: string;
  status: string;
  createdAt: Date;
  requester: {
    id: string;
    name: string;
    userNumber: number;
  };
  match: {
    id: string;
    gameType: string;
    games: any;
    player1: { name: string; userNumber: number };
    player2: { name: string; userNumber: number };
    player3?: { name: string; userNumber: number } | null;
    player4?: { name: string; userNumber: number } | null;
  };
}

interface CorrectionRequestCardProps {
  request: CorrectionRequest;
  isCreator: boolean;
}

export default function CorrectionRequestCard({ request, isCreator }: CorrectionRequestCardProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async () => {
    if (!confirm('Approve this correction request?')) return;
    
    setIsProcessing(true);
    const result = await approveCorrectionRequest(request.id);
    
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || 'Failed to approve request');
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt('Optional: Provide a reason for rejection');
    
    setIsProcessing(true);
    const result = await rejectCorrectionRequest(request.id, reason || undefined);
    
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || 'Failed to reject request');
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="card border-l-4 border-yellow-500">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded font-medium ${getStatusColor(request.status)}`}>
            {request.status.toUpperCase()}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(request.createdAt).toLocaleDateString()}
          </span>
        </div>
        <span className="text-xs text-gray-600">
          {request.match.gameType}
        </span>
      </div>

      <div className="mb-3">
        <div className="text-sm text-gray-600">Requested by:</div>
        <div className="font-medium">
          {formatUserDisplayName(request.requester.name, request.requester.userNumber)}
        </div>
      </div>

      <div className="mb-3">
        <div className="text-sm text-gray-600">Match:</div>
        <div className="text-sm font-medium">
          {formatUserDisplayName(request.match.player1.name, request.match.player1.userNumber)}
          {request.match.player2 && request.match.gameType === 'doubles' && (
            <> & {formatUserDisplayName(request.match.player2.name, request.match.player2.userNumber)}</>
          )}
          {' vs '}
          {request.match.gameType === 'singles'
            ? formatUserDisplayName(request.match.player2.name, request.match.player2.userNumber)
            : request.match.player3 && request.match.player4
              ? `${formatUserDisplayName(request.match.player3.name, request.match.player3.userNumber)} & ${formatUserDisplayName(request.match.player4.name, request.match.player4.userNumber)}`
              : 'Unknown'
          }
        </div>
      </div>

      <div className="p-3 bg-gray-50 rounded mb-3">
        <div className="text-sm font-medium text-gray-700 mb-1">Reason:</div>
        <div className="text-sm text-gray-900">{request.reason}</div>
      </div>

      {isCreator && request.status === 'pending' && (
        <div className="flex gap-2 pt-3 border-t">
          <button
            onClick={handleApprove}
            disabled={isProcessing}
            className="btn-primary flex-1 text-sm py-2"
          >
            ✅ Approve
          </button>
          <button
            onClick={handleReject}
            disabled={isProcessing}
            className="btn-danger flex-1 text-sm py-2"
          >
            ❌ Reject
          </button>
        </div>
      )}
    </div>
  );
}