'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { requestScoreCorrection } from '@/actions/corrections';

type GameScore = { team1: number; team2: number };

interface RequestCorrectionFormProps {
  matchId: string;
  eventId?: string | null;
  currentGames: GameScore[];
}

export default function RequestCorrectionForm({
  matchId,
  eventId,
  currentGames,
}: RequestCorrectionFormProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [proposedGames, setProposedGames] = useState<GameScore[]>(() =>
    currentGames.map((g) => ({ team1: g.team1, team2: g.team2 }))
  );

  const currentDisplay = useMemo(
    () => currentGames.map((g) => `${g.team1}-${g.team2}`).join(', '),
    [currentGames]
  );

  const handleGameChange = (index: number, side: 'team1' | 'team2', value: number) => {
    setProposedGames((prev) => {
      const next = prev.map((g, i) => (i === index ? { ...g, [side]: value } : g));
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      setError('Please provide a reason for the correction');
      return;
    }

    const valid = proposedGames.every((g) => Number.isFinite(g.team1) && Number.isFinite(g.team2));
    if (!valid) {
      setError('Please enter valid numbers for each game');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await requestScoreCorrection(matchId, reason, proposedGames, eventId ?? null);

      if (result.success) {
        setIsOpen(false);
        setReason('');
        setProposedGames(currentGames.map((g) => ({ team1: g.team1, team2: g.team2 })));
        router.refresh();
        alert('Correction request submitted. Your opponent can accept or reject it.');
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
        Request Correction
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
        <div className="text-sm text-gray-600">
          <span className="font-medium">Current score (games):</span> {currentDisplay}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Proposed score (each game)</label>
          <div className="space-y-2">
            {proposedGames.map((game, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-16">Game {index + 1}:</span>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={game.team1}
                  onChange={(e) => handleGameChange(index, 'team1', parseInt(e.target.value, 10) || 0)}
                  className="input-field w-16 text-center"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={game.team2}
                  onChange={(e) => handleGameChange(index, 'team2', parseInt(e.target.value, 10) || 0)}
                  className="input-field w-16 text-center"
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Reason for correction *</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why the score needs to be corrected..."
            className="input w-full h-24"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Your opponent will be able to accept or reject this correction.
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
