// 'use client';

// import { useState, useEffect } from 'react';

// interface Organization {
//   id: string;
//   name: string;
//   type: string;
//   location: string;
//   _count: {
//     members: number;
//   };
// }

// interface OrganizationSelectorProps {
//   value: string;
//   onChange: (organizationId: string) => void;
// }

// export default function OrganizationSelector({ value, onChange }: OrganizationSelectorProps) {
//   const [organizations, setOrganizations] = useState<Organization[]>([]);
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
  
//   // Create organization form state
//   const [newOrgName, setNewOrgName] = useState('');
//   const [newOrgType, setNewOrgType] = useState<'Club' | 'College'>('Club');
//   const [newOrgLocation, setNewOrgLocation] = useState('');
//   const [isCreating, setIsCreating] = useState(false);
  
//   useEffect(() => {
//     loadOrganizations();
//   }, []);
  
//   const loadOrganizations = async () => {
//     setIsLoading(true);
//     try {
//       const response = await fetch('/api/organizations');
//       if (response.ok) {
//         const orgs = await response.json();
//         setOrganizations(orgs);
//       }
//     } catch (error) {
//       console.error('Error loading organizations:', error);
//     }
//     setIsLoading(false);
//   };
  
//   const handleCreateOrganization = async (e: React.FormEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
    
//     if (!newOrgName.trim() || !newOrgLocation.trim()) {
//       alert('Please fill in all fields');
//       return;
//     }
    
//     setIsCreating(true);
    
//     try {
//       const response = await fetch('/api/organizations', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           name: newOrgName,
//           type: newOrgType,
//           location: newOrgLocation,
//         }),
//       });
      
//       const result = await response.json();
      
//       setIsCreating(false);
      
//       if (response.ok && result.success && result.organization) {
//         const newOrg = { ...result.organization, _count: { members: 0 } };
        
//         // Update organizations list
//         setOrganizations([...organizations, newOrg]);
        
//         // Select the new organization
//         onChange(result.organization.id);
        
//         // Close modal and reset form
//         setShowCreateModal(false);
//         setNewOrgName('');
//         setNewOrgType('Club');
//         setNewOrgLocation('');
        
//         console.log('Organization created successfully:', result.organization.id);
//       } else {
//         alert(result.error || 'Failed to create organization');
//       }
//     } catch (error) {
//       console.error('Error creating organization:', error);
//       alert('An error occurred while creating the organization');
//       setIsCreating(false);
//     }
//   };
  
//   return (
//     <div className="space-y-2">
//       <label className="block text-sm font-medium text-gray-700">
//         Organization
//       </label>
      
//       <div className="flex gap-2">
//         <select
//           value={value}
//           onChange={(e) => onChange(e.target.value)}
//           className="input-field flex-1"
//           required
//         >
//           <option value="">Select an organization</option>
//           {organizations.map((org) => (
//             <option key={org.id} value={org.id}>
//               {org.name} ({org.type}) - {org.location} ({org._count.members} members)
//             </option>
//           ))}
//         </select>
        
//         <button
//           type="button"
//           onClick={() => setShowCreateModal(true)}
//           className="btn-secondary whitespace-nowrap"
//         >
//           + Create New
//         </button>
//       </div>
      
//       {/* Create Organization Modal */}
//       {showCreateModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg p-6 max-w-md w-full">
//             <h2 className="text-xl font-bold mb-4">Create New Organization</h2>
            
//             <form onSubmit={handleCreateOrganization} className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Organization Name
//                 </label>
//                 <input
//                   type="text"
//                   value={newOrgName}
//                   onChange={(e) => setNewOrgName(e.target.value)}
//                   className="input-field"
//                   placeholder="e.g., Riverside Badminton Club"
//                   required
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Type
//                 </label>
//                 <select
//                   value={newOrgType}
//                   onChange={(e) => setNewOrgType(e.target.value as 'Club' | 'College')}
//                   className="input-field"
//                 >
//                   <option value="Club">Club</option>
//                   <option value="College">College</option>
//                 </select>
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Location
//                 </label>
//                 <input
//                   type="text"
//                   value={newOrgLocation}
//                   onChange={(e) => setNewOrgLocation(e.target.value)}
//                   className="input-field"
//                   placeholder="e.g., San Francisco, CA"
//                   required
//                 />
//               </div>
              
//               <div className="flex gap-2 justify-end pt-2">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowCreateModal(false);
//                     setNewOrgName('');
//                     setNewOrgType('Club');
//                     setNewOrgLocation('');
//                   }}
//                   className="btn-secondary"
//                   disabled={isCreating}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="btn-primary"
//                   disabled={isCreating}
//                 >
//                   {isCreating ? 'Creating...' : 'Create Organization'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

'use client';

import { useState, useEffect } from 'react';
import { getAllOrganizations } from '@/actions/organization';
import CreateOrganizationForm from '@/components/CreateOrganizationForm';

interface Organization {
  id: string;
  name: string;
  type?: string;
  location?: string;
  description?: string | null;
  _count?: { members: number };
}

interface OrganizationSelectorProps {
  value: string;
  onChange: (organizationId: string) => void;
}

export default function OrganizationSelector({ value, onChange }: OrganizationSelectorProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadOrganizations();
  }, []);
  
  const loadOrganizations = async () => {
    setIsLoading(true);
    const orgs = await getAllOrganizations();
    setOrganizations(orgs);
    setIsLoading(false);
  };
  
  const handleOrganizationCreated = async (newOrgId: string) => {
    await loadOrganizations();
    onChange(newOrgId);
    setShowCreateForm(false);
  };
  
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Organization
      </label>
      
      {!showCreateForm ? (
        <>
          <div className="flex gap-2">
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="input-field flex-1"
              required
            >
              <option value="">Select an organization</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                  {org.type && ` (${org.type})`}
                  {org.location && ` - ${org.location}`}
                  {org._count?.members !== undefined && ` (${org._count.members} members)`}
                </option>
              ))}
            </select>
            
            <button
              type="button"
              onClick={() => setShowCreateForm(true)}
              className="btn-secondary whitespace-nowrap"
            >
              + Create New
            </button>
          </div>
        </>
      ) : (
        <CreateOrganizationForm
          onSuccess={handleOrganizationCreated}
          onCancel={() => setShowCreateForm(false)}
        />
      )}
    </div>
  );
}