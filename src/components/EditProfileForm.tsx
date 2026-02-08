'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateProfile, updateSelfRating } from '@/actions/user';
import { getAllOrganizations } from '@/actions/organization';
import SelfRatingSlider from './SelfRatingSlider';

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

const QUESTIONS = [
  'How comfortable are you with basic grip and footwork?',
  'Can you rally consistently without mistakes?',
  'How well do you control shot placement?',
  'How strong and consistent is your overhead technique?',
  'How well do you move and recover on court?',
  'How do you handle match situations and strategy?',
  'How experienced are you with competitive play?',
  'Can you teach or analyze badminton technique?',
];

export default function EditProfileForm({ user }: EditProfileFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Basic info
  const [name, setName] = useState(user.name);
  const [location, setLocation] = useState(user.location);
  const [sex, setSex] = useState(user.sex);
  const [preferredGameType, setPreferredGameType] = useState(user.preferredGameType);
  
  // Self-rating
  const [selfRating, setSelfRating] = useState(user.selfRating || {
    question1: 5,
    question2: 5,
    question3: 5,
    question4: 5,
    question5: 5,
    question6: 5,
    question7: 5,
    question8: 5,
  });

  const updateSelfRatingValue = (questionNum: number, value: number) => {
    setSelfRating({
      ...selfRating,
      [`question${questionNum}`]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Update basic profile
    const profileResult = await updateProfile({
      name,
      location,
      sex,
      preferredGameType,
    });

    // Update self-rating
    const ratingResult = await updateSelfRating(selfRating as any);

    if (profileResult.success && ratingResult.success) {
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

      {/* Self-Rating */}
      <div className="card" id="self-rating">
        <h2 className="text-xl font-bold mb-2">Update Self-Rating</h2>
        <p className="text-sm text-gray-600 mb-4">
          Updating your self-rating will recalculate your rating based on your current assessment.
        </p>
        
        <div className="space-y-6">
          {QUESTIONS.map((question, index) => (
            <SelfRatingSlider
              key={index}
              question={`${index + 1}. ${question}`}
              value={selfRating[`question${index + 1}` as keyof typeof selfRating]}
              onChange={(value) => updateSelfRatingValue(index + 1, value)}
            />
          ))}
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
