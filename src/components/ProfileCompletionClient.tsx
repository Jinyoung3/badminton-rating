// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { completeProfile } from '@/actions/user';
// import { getOrganizations } from '@/actions/organization';
// import CreateOrganizationForm from '@/components/CreateOrganizationForm';

// interface Organization {
//   id: string;
//   name: string;
//   description: string | null;
// }

// export default function ProfileCompletionClient() {
//   const router = useRouter();
//   const [step, setStep] = useState(1);
  
//   // Form state - preserved during organization creation
//   const [name, setName] = useState('');
//   const [location, setLocation] = useState('');
//   const [sex, setSex] = useState<'male' | 'female' | 'other'>('male');
//   const [preferredGameType, setPreferredGameType] = useState<'singles' | 'doubles' | 'both'>('both');
//   const [organizationId, setOrganizationId] = useState('');
  
//   // Self-rating state
//   const [selfRating, setSelfRating] = useState({
//     question1: 5,
//     question2: 5,
//     question3: 5,
//     question4: 5,
//     question5: 5,
//     question6: 5,
//     question7: 5,
//     question8: 5,
//   });

//   // Organizations state
//   const [organizations, setOrganizations] = useState<Organization[]>([]);
//   const [showCreateOrg, setShowCreateOrg] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   // Load organizations on mount
//   useEffect(() => {
//     loadOrganizations();
//   }, []);

//   const loadOrganizations = async () => {
//     const orgs = await getOrganizations();
//     setOrganizations(orgs);
//   };

//   const handleOrganizationCreated = async (newOrgId: string) => {
//     // Reload organizations WITHOUT resetting form
//     await loadOrganizations();
//     setOrganizationId(newOrgId);
//     setShowCreateOrg(false);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       const result = await completeProfile({
//         name,
//         location,
//         sex,
//         preferredGameType,
//         organizationId,
//         selfRating,
//       });

//       if (result.success) {
//         router.push('/dashboard');
//         router.refresh();
//       } else {
//         setError(result.error || 'Failed to complete profile');
//       }
//     } catch (err) {
//       setError('An error occurred. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRatingChange = (question: string, value: number) => {
//     setSelfRating(prev => ({ ...prev, [question]: value }));
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-2xl mx-auto px-4">
//         <div className="card">
//           <div className="text-center mb-8">
//             <h1 className="text-3xl font-bold">Complete Your Profile</h1>
//             <p className="text-gray-600 mt-2">
//               Step {step} of 2 - Let's get you set up!
//             </p>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-6">
//             {/* Step 1: Basic Information */}
//             {step === 1 && (
//               <div className="space-y-4">
//                 <h2 className="text-xl font-bold mb-4">Basic Information</h2>

//                 <div>
//                   <label className="block text-sm font-medium mb-1">
//                     Display Name *
//                   </label>
//                   <input
//                     type="text"
//                     value={name}
//                     onChange={(e) => setName(e.target.value)}
//                     placeholder="Your name"
//                     className="input w-full"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-1">
//                     Location *
//                   </label>
//                   <input
//                     type="text"
//                     value={location}
//                     onChange={(e) => setLocation(e.target.value)}
//                     placeholder="City, State or Country"
//                     className="input w-full"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-1">
//                     Sex *
//                   </label>
//                   <select
//                     value={sex}
//                     onChange={(e) => setSex(e.target.value as 'male' | 'female' | 'other')}
//                     className="input w-full"
//                     required
//                   >
//                     <option value="male">Male</option>
//                     <option value="female">Female</option>
//                     <option value="other">Other</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-1">
//                     Preferred Game Type *
//                   </label>
//                   <select
//                     value={preferredGameType}
//                     onChange={(e) => setPreferredGameType(e.target.value as 'singles' | 'doubles' | 'both')}
//                     className="input w-full"
//                     required
//                   >
//                     <option value="singles">Singles</option>
//                     <option value="doubles">Doubles</option>
//                     <option value="both">Both</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-1">
//                     Organization *
//                   </label>
                  
//                   {!showCreateOrg ? (
//                     <>
//                       <select
//                         value={organizationId}
//                         onChange={(e) => setOrganizationId(e.target.value)}
//                         className="input w-full mb-2"
//                         required
//                       >
//                         <option value="">Select an organization</option>
//                         {organizations.map((org) => (
//                           <option key={org.id} value={org.id}>
//                             {org.name}
//                           </option>
//                         ))}
//                       </select>
                      
//                       <button
//                         type="button"
//                         onClick={() => setShowCreateOrg(true)}
//                         className="text-sm text-primary-600 hover:underline"
//                       >
//                         + Create New Organization
//                       </button>
//                     </>
//                   ) : (
//                     <CreateOrganizationForm
//                       onSuccess={handleOrganizationCreated}
//                       onCancel={() => setShowCreateOrg(false)}
//                     />
//                   )}
//                 </div>

//                 <button
//                   type="button"
//                   onClick={() => setStep(2)}
//                   className="btn-primary w-full"
//                   disabled={!name || !location || !organizationId}
//                 >
//                   Continue to Self-Rating →
//                 </button>
//               </div>
//             )}

//             {/* Step 2: Self-Rating */}
//             {step === 2 && (
//               <div className="space-y-4">
//                 <div className="flex justify-between items-center mb-4">
//                   <h2 className="text-xl font-bold">Self-Rating Assessment</h2>
//                   <button
//                     type="button"
//                     onClick={() => setStep(1)}
//                     className="text-sm text-gray-600 hover:underline"
//                   >
//                     ← Back
//                   </button>
//                 </div>

//                 <p className="text-sm text-gray-600 mb-4">
//                   Rate yourself from 1-10 on each skill (1 = Beginner, 10 = Expert)
//                 </p>

//                 {[
//                   { key: 'question1', label: 'Grip & Footwork' },
//                   { key: 'question2', label: 'Rally Consistency' },
//                   { key: 'question3', label: 'Shot Placement' },
//                   { key: 'question4', label: 'Overhead Technique' },
//                   { key: 'question5', label: 'Court Movement' },
//                   { key: 'question6', label: 'Match Strategy' },
//                   { key: 'question7', label: 'Competitive Experience' },
//                   { key: 'question8', label: 'Teaching Ability' },
//                 ].map((item) => (
//                   <div key={item.key}>
//                     <div className="flex justify-between items-center mb-2">
//                       <label className="text-sm font-medium">{item.label}</label>
//                       <span className="text-lg font-bold text-primary-600">
//                         {selfRating[item.key as keyof typeof selfRating]}/10
//                       </span>
//                     </div>
//                     <input
//                       type="range"
//                       min="1"
//                       max="10"
//                       value={selfRating[item.key as keyof typeof selfRating]}
//                       onChange={(e) => handleRatingChange(item.key, parseInt(e.target.value))}
//                       className="w-full"
//                     />
//                   </div>
//                 ))}

//                 {error && (
//                   <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
//                     {error}
//                   </div>
//                 )}

//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="btn-primary w-full"
//                 >
//                   {loading ? 'Completing Profile...' : 'Complete Profile 🎉'}
//                 </button>
//               </div>
//             )}
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { completeProfile } from '@/actions/user';
// FIX: Updated to match the actual exported name in organization.ts
import { getAllOrganizations } from '@/actions/organization';
import CreateOrganizationForm from '@/components/CreateOrganizationForm';

// FIX: Synchronized with the Organization model in schema.prisma
interface Organization {
  id: string;
  name: string;
  type: string;
  location: string;
}

export default function ProfileCompletionClient({ email }: { email: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [sex, setSex] = useState<'male' | 'female' | 'other'>('male');
  const [preferredGameType, setPreferredGameType] = useState<'singles' | 'doubles' | 'both'>('both');
  const [organizationId, setOrganizationId] = useState('');
  
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

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    // FIX: Using the correct action function
    const orgs = await getAllOrganizations();
    // Casting to any or updating the interface ensures compatibility with count metadata
    setOrganizations(orgs as any);
  };

  const handleOrganizationCreated = async (newOrgId: string) => {
    await loadOrganizations();
    setOrganizationId(newOrgId);
    setShowCreateOrg(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await completeProfile({
        email,
        name,
        location,
        sex,
        preferredGameType,
        organizationId,
        selfRating,
      });

      if (result.success) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(result.error || 'Failed to complete profile');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (question: string, value: number) => {
    setSelfRating(prev => ({ ...prev, [question]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="card">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Complete Your Profile</h1>
            <p className="text-gray-600 mt-2">
              Step {step} of 2 - Let's get you set up!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold mb-4">Basic Information</h2>
                <div>
                  <label className="block text-sm font-medium mb-1">Display Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Location *</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, State or Country"
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Sex *</label>
                  <select
                    value={sex}
                    onChange={(e) => setSex(e.target.value as any)}
                    className="input w-full"
                    required
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Preferred Game Type *</label>
                  <select
                    value={preferredGameType}
                    onChange={(e) => setPreferredGameType(e.target.value as any)}
                    className="input w-full"
                    required
                  >
                    <option value="singles">Singles</option>
                    <option value="doubles">Doubles</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Organization *</label>
                  {!showCreateOrg ? (
                    <>
                      <select
                        value={organizationId}
                        onChange={(e) => setOrganizationId(e.target.value)}
                        className="input w-full mb-2"
                        required
                      >
                        <option value="">Select an organization</option>
                        {organizations.map((org) => (
                          <option key={org.id} value={org.id}>
                            {org.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowCreateOrg(true)}
                        className="text-sm text-primary-600 hover:underline"
                      >
                        + Create New Organization
                      </button>
                    </>
                  ) : (
                    <CreateOrganizationForm
                      onSuccess={handleOrganizationCreated}
                      onCancel={() => setShowCreateOrg(false)}
                    />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-primary w-full"
                  disabled={!name || !location || !organizationId}
                >
                  Continue to Self-Rating →
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Self-Rating Assessment</h2>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-sm text-gray-600 hover:underline"
                  >
                    ← Back
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Rate yourself from 1-10 on each skill (1 = Beginner, 10 = Expert)
                </p>
                {[
                  { key: 'question1', label: 'Grip & Footwork' },
                  { key: 'question2', label: 'Rally Consistency' },
                  { key: 'question3', label: 'Shot Placement' },
                  { key: 'question4', label: 'Overhead Technique' },
                  { key: 'question5', label: 'Court Movement' },
                  { key: 'question6', label: 'Match Strategy' },
                  { key: 'question7', label: 'Competitive Experience' },
                  { key: 'question8', label: 'Teaching Ability' },
                ].map((item) => (
                  <div key={item.key}>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium">{item.label}</label>
                      <span className="text-lg font-bold text-primary-600">
                        {selfRating[item.key as keyof typeof selfRating]}/10
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={selfRating[item.key as keyof typeof selfRating]}
                      onChange={(e) => handleRatingChange(item.key, parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                ))}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? 'Completing Profile...' : 'Complete Profile 🎉'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}