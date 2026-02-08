'use client';

import { useState } from 'react';
import { requestScoreCorrection } from '@/actions/corrections';

interface RequestCorrectionFormProps {
  matchId: string;
  eventId: string;
  onSuccess?: () => void;
}

export default function RequestCorrectionForm({ 
  matchId, 
  eventId,
  onSuccess 
}: RequestCorrectionFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      setError('Please provide a reason for the correction');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await requestScoreCorrection(matchId, eventId, reason);
      
      if (result.success) {
        setIsOpen(false);
        setReason('');
        onSuccess?.();
        alert('Correction request submitted successfully!');
      } else {
        setError(result.error || 'Failed to submit correction request');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="btn-secondary text-sm"
      >
        🚨 Request Correction
      </button>
    );
  }

  return (
    <div className="border-2 border-yellow-400 rounded-lg p-4 bg-yellow-50">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-lg">Request Score Correction</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">
            Reason for Correction *
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why the score needs to be corrected..."
            className="input w-full h-24"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            The event creator will review your request
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1"
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}