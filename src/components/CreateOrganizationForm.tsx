'use client';

import { useState } from 'react';
import { createOrganization } from '@/actions/organization';

interface CreateOrganizationFormProps {
  onSuccess: (organizationId: string) => void;
  onCancel: () => void;
}

export default function CreateOrganizationForm({ onSuccess, onCancel }: CreateOrganizationFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!name.trim()) {
      setError('Organization name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await createOrganization({ name, description });
      
      if (result.success && result.organization) {
        // Don't reload page - just notify parent component
        onSuccess(result.organization.id);
      } else {
        setError(result.error || 'Failed to create organization');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-2 border-blue-400 rounded-lg p-6 bg-blue-50">
      <h3 className="text-xl font-bold mb-4">Create New Organization</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Organization Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Stanford Badminton Club"
            className="input w-full"
            required
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of your organization..."
            className="input w-full h-20"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1"
          >
            {loading ? 'Creating...' : 'Create Organization'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}