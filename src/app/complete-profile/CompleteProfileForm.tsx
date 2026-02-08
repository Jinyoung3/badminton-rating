'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createUserProfile } from '@/actions/user';
import SelfRatingSlider from '@/components/SelfRatingSlider';
import OrganizationSelector from '@/components/OrganizationSelector';

interface CompleteProfileFormProps {
  email: string;
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

export default function CompleteProfileForm({ email }: CompleteProfileFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Basic profile fields
  const [name, setName] = useState('');
  const [sex, setSex] = useState('');
  const [location, setLocation] = useState('');
  const [preferredGameType, setPreferredGameType] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  
  // Self-rating answers (default all to 5)
  const [selfRating, setSelfRating] = useState({
    question1: 5,
    question2: 5,
    question3: 5,
    question4: 5,
    question5: 5,
    question6: 5,
    question7: 5,
    question8: 5,
  });
  
  // Debug: Log when component mounts/unmounts
  useEffect(() => {
    console.log('CompleteProfileForm mounted');
    return () => console.log('CompleteProfileForm unmounted');
  }, []);
  
  // Debug: Log when form values change
  useEffect(() => {
    console.log('Form state:', { name, sex, location, preferredGameType, organizationId });
  }, [name, sex, location, preferredGameType, organizationId]);
  
  const updateSelfRating = (questionNum: number, value: number) => {
    setSelfRating({
      ...selfRating,
      [`question${questionNum}`]: value,
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted with values:', { name, sex, location, preferredGameType, organizationId });
    
    if (!name || !sex || !location || !preferredGameType || !organizationId) {
      alert('Please fill in all fields');
      return;
    }
    
    setIsSubmitting(true);
    
    const result = await createUserProfile({
      email,
      name,
      sex,
      location,
      preferredGameType,
      organizationId,
      selfRating,
    });
    
    if (result.success) {
      router.push('/dashboard');
    } else {
      alert('Failed to create profile. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-6">
      {/* Basic Information */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Basic Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                console.log('Name changed to:', e.target.value);
                setName(e.target.value);
              }}
              className="input-field"
              placeholder="John Smith"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sex
            </label>
            <select
              value={sex}
              onChange={(e) => {
                console.log('Sex changed to:', e.target.value);
                setSex(e.target.value);
              }}
              className="input-field"
              required
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => {
                console.log('Location changed to:', e.target.value);
                setLocation(e.target.value);
              }}
              className="input-field"
              placeholder="San Francisco, CA"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Game Type
            </label>
            <select
              value={preferredGameType}
              onChange={(e) => {
                console.log('Game type changed to:', e.target.value);
                setPreferredGameType(e.target.value);
              }}
              className="input-field"
              required
            >
              <option value="">Select</option>
              <option value="Singles">Singles</option>
              <option value="Doubles">Doubles</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4">
          <OrganizationSelector
            value={organizationId}
            onChange={(id) => {
              console.log('Organization selected:', id);
              setOrganizationId(id);
            }}
          />
        </div>
      </div>
      
      {/* Self-Rating Questionnaire */}
      <div className="pt-6 border-t">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Self-Rating Assessment</h2>
        <p className="text-sm text-gray-600 mb-6">
          Rate yourself honestly on a scale of 1-10 for each question. This will determine your initial rating.
        </p>
        
        <div className="space-y-6">
          {QUESTIONS.map((question, index) => (
            <SelfRatingSlider
              key={index}
              question={`${index + 1}. ${question}`}
              value={selfRating[`question${index + 1}` as keyof typeof selfRating]}
              onChange={(value) => updateSelfRating(index + 1, value)}
            />
          ))}
        </div>
      </div>
      
      {/* Submit Button */}
      <div className="pt-6 border-t">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-primary py-3 text-lg"
        >
          {isSubmitting ? 'Creating Profile...' : 'Complete Profile'}
        </button>
      </div>
    </form>
  );
}
