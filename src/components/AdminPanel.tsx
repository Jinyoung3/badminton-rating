'use client';

import { useState, useTransition } from 'react';
import {
  deleteEventAdmin,
  deleteMatchAdmin,
  deleteOrganizationAdmin,
  deletePlayerAdmin,
} from '@/actions/admin';
import { formatUserDisplayName } from '@/lib/utils';

interface AdminPanelProps {
  players: any[];
  organizations: any[];
  events: any[];
  matches: any[];
}

export default function AdminPanel({
  players,
  organizations,
  events,
  matches,
}: AdminPanelProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>('');

  const run = (label: string, action: () => Promise<{ success: boolean; error?: string }>) => {
    const confirmed = window.confirm(`Are you sure you want to delete this ${label}? This cannot be undone.`);
    if (!confirmed) return;

    startTransition(async () => {
      const result = await action();
      setMessage(result.success ? `${label} deleted.` : result.error ?? `Failed to delete ${label}.`);
      if (result.success) {
        window.location.reload();
      }
    });
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className="card border border-amber-300 bg-amber-50 text-amber-900">
          {message}
        </div>
      )}

      <div className="card border border-red-200 bg-red-50">
        <h2 className="text-xl font-bold text-red-700 mb-2">Danger Zone</h2>
        <p className="text-sm text-red-700">
          Admin-only destructive actions. Deleting organizations/events can cascade to related data.
        </p>
      </div>

      <div className="card">
        <h3 className="text-lg font-bold mb-3">Players ({players.length})</h3>
        <div className="space-y-2">
          {players.map((player) => (
            <div key={player.id} className="flex items-center justify-between border rounded p-3">
              <div>
                <div className="font-medium">
                  {formatUserDisplayName(player.name, player.userNumber)} {player.isAdmin ? '(Admin)' : ''}
                </div>
                <div className="text-xs text-gray-600">{player.email}</div>
                <div className="text-xs text-gray-500">ID: {player.id}</div>
              </div>
              <button
                className="btn-secondary text-red-700 border-red-300 hover:bg-red-50"
                disabled={isPending || player.isAdmin}
                onClick={() => run('player', () => deletePlayerAdmin(player.id))}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-bold mb-3">Organizations ({organizations.length})</h3>
        <div className="space-y-2">
          {organizations.map((org) => (
            <div key={org.id} className="flex items-center justify-between border rounded p-3">
              <div>
                <div className="font-medium">{org.name}</div>
                <div className="text-xs text-gray-600">{org.location}</div>
                <div className="text-xs text-gray-500">
                  Members: {org._count.members} · Events: {org._count.events}
                </div>
                <div className="text-xs text-gray-500">ID: {org.id}</div>
              </div>
              <button
                className="btn-secondary text-red-700 border-red-300 hover:bg-red-50"
                disabled={isPending}
                onClick={() => run('organization', () => deleteOrganizationAdmin(org.id))}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-bold mb-3">Events ({events.length})</h3>
        <div className="space-y-2">
          {events.map((event) => (
            <div key={event.id} className="flex items-center justify-between border rounded p-3">
              <div>
                <div className="font-medium">{event.name}</div>
                <div className="text-xs text-gray-600">
                  {event.organization?.name} · by {formatUserDisplayName(event.creator.name, event.creator.userNumber)}
                </div>
                <div className="text-xs text-gray-500">
                  Participants: {event._count.participants} · Matches: {event._count.matches}
                </div>
                <div className="text-xs text-gray-500">ID: {event.id}</div>
              </div>
              <button
                className="btn-secondary text-red-700 border-red-300 hover:bg-red-50"
                disabled={isPending}
                onClick={() => run('event', () => deleteEventAdmin(event.id))}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-bold mb-3">Matches ({matches.length})</h3>
        <div className="space-y-2">
          {matches.map((match) => (
            <div key={match.id} className="flex items-center justify-between border rounded p-3">
              <div>
                <div className="font-medium">
                  {formatUserDisplayName(match.player1.name, match.player1.userNumber)} vs{' '}
                  {formatUserDisplayName(match.player2.name, match.player2.userNumber)}
                </div>
                <div className="text-xs text-gray-600">
                  {match.type} · {match.gameType} · {new Date(match.matchDate).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">Event: {match.event?.name ?? 'N/A'}</div>
                <div className="text-xs text-gray-500">ID: {match.id}</div>
              </div>
              <button
                className="btn-secondary text-red-700 border-red-300 hover:bg-red-50"
                disabled={isPending}
                onClick={() => run('match', () => deleteMatchAdmin(match.id))}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
