'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateProfile } from '@/actions/user';

interface EditProfileFormProps {
  user: {
    id: string;
    name: string;
    location: string;
    sex: string;
    preferredGameType: string;
    organizationId: string | null;
    selfRating: {
      question1: number;
      question2: number;
      question3: number;
      question4: number;
      question5: number;
      question6: number;
      question7: number;
      question8: number;
    } | null;
  };
}

export default function EditProfileForm({ user }: EditProfileFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState(user.name);
  const [location, setLocation] = useState(user.location);
  const [sex, setSex] = useState(user.sex);
  const [preferredGameType, setPreferredGameType] = useState(user.preferredGameType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const profileResult = await updateProfile({
      name,
      location,
      sex,
      preferredGameType,
    });

    if (profileResult.success) {
      router.push('/profile');
      router.refresh();
    } else {
      alert('Failed to update profile');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Basic Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sex
            </label>
            <select
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              className="input-field"
              required
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Game Type
            </label>
            <select
              value={preferredGameType}
              onChange={(e) => setPreferredGameType(e.target.value)}
              className="input-field"
              required
            >
              <option value="Singles">Singles</option>
              <option value="Doubles">Doubles</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary flex-1"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary flex-1"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
