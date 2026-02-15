import { getCurrentUser } from '@/actions/user';
import { getEventById } from '@/actions/event';
import { notFound, redirect } from 'next/navigation';
import { formatUserDisplayName } from '@/lib/utils';
import LeaveEventButton from '@/components/LeaveEventButton';
import ParticipantActions from '@/components/ParticipantActions';
import RecordEventMatchButton from '@/components/RecordEventMatchButton';
import Link from 'next/link';
import CorrectionRequestCard from '@/components/CorrectionRequestCard';
import { getEventCorrectionRequests } from '@/actions/corrections';

interface EventDetailPageProps {
  params: {
    id: string;
  };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const user = await getCurrentUser();
  const event = await getEventById(params.id);
  
  if (!user) {
    redirect('/sign-in');
  }
  
  if (!event) {
    notFound();
  }
  
  const isCreator = event.creator.id === user.id;
  const isParticipant = event.participants.some(p => p.user.id === user.id);
  
  // Get active participants (not absent)
  const activeParticipants = event.participants.filter(p => !p.isAbsent);
  const correctionsData = isCreator 
  ? await getEventCorrectionRequests(event.id)
  : { success: true, requests: [] };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold">{event.name}</h1>
            <p className="text-gray-600 mt-1">{event.organization.name}</p>
          </div>
          {isCreator && (
            <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
              Event Creator
            </span>
          )}
        </div>
        
        {event.description && (
          <p className="text-gray-700 mb-4">{event.description}</p>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-gray-600">
            <span className="text-2xl mr-2">📍</span>
            <div>
              <div className="text-sm text-gray-500">Location</div>
              <div className="font-medium">{event.location}</div>
            </div>
          </div>
          
          <div className="flex items-center text-gray-600">
            <span className="text-2xl mr-2">📅</span>
            <div>
              <div className="text-sm text-gray-500">Date & Time</div>
              <div className="font-medium">
                {new Date(event.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
              <div className="text-sm text-gray-600">
                {new Date(event.date).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
          
          <div className="flex items-center text-gray-600">
            <span className="text-2xl mr-2">👥</span>
            <div>
              <div className="text-sm text-gray-500">Participants</div>
              <div className="font-medium">{event._count.participants} players</div>
            </div>
          </div>
        </div>
        
        <div className="text-sm text-gray-500 mb-4">
          Created by {formatUserDisplayName(event.creator.name, event.creator.userNumber)}
        </div>
        
        {isParticipant && !isCreator && (
          <div className="pt-4 border-t">
            <LeaveEventButton eventId={event.id} />
          </div>
        )}
      </div>
      
      {/* Record Match (Creator Only) */}
      {isCreator && activeParticipants.length >= 2 && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">⚔️ Record Match</h2>
          <p className="text-gray-600 mb-4">
            Record matches between event participants. Ratings will be updated automatically.
          </p>
          <RecordEventMatchButton
            eventId={event.id}
            participants={activeParticipants.map(p => p.user)}
          />
        </div>
      )}
      
      {/* Participants */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">
          Participants ({event.participants.length})
        </h2>
        
        {event.participants.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-4xl mb-2">👥</p>
            <p>No participants yet</p>
            <p className="text-sm mt-1">Share the event code to invite players!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {event.participants.map((participant) => (
              <div
                key={participant.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  participant.isAbsent
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div>
                    <div className="font-medium flex items-center space-x-2">
                      <span>
                        {formatUserDisplayName(participant.user.name, participant.user.userNumber)}
                      </span>
                      {participant.user.id === event.creator.id && (
                        <span className="text-xs bg-primary-100 text-primary-800 px-2 py-0.5 rounded">
                          Creator
                        </span>
                      )}
                      {participant.isAbsent && (
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                          Absent
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      Rating: {participant.user.rating} • {participant.user.preferredGameType}
                    </div>
                  </div>
                </div>
                
                {isCreator && participant.user.id !== user.id && (
                  <ParticipantActions
                    eventId={event.id}
                    participantId={participant.user.id}
                    isAbsent={participant.isAbsent}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Matches */}
      {event._count.matches > 0 && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">
            Matches ({event._count.matches})
          </h2>
          <p className="text-gray-600">Viewing match history coming in Phase 5...</p>
        </div>
      )}
      {/* Correction Requests Section */}
      {isCreator && correctionsData.success && correctionsData.requests && correctionsData.requests.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🚨</span>
            <h2 className="text-2xl font-bold">
              Score Correction Requests ({correctionsData.requests.length})
            </h2>
          </div>
          
          <div className="space-y-3">
            {correctionsData.requests.map((request: any) => (
              <CorrectionRequestCard
                key={request.id}
                request={request}
                isCreator={true}
              />
            ))}
          </div>
          
          <p className="text-sm text-gray-500 mt-3">
            Review and approve/reject correction requests from participants
          </p>
        </div>
      )}
      
      {/* Back Button */}
      <Link href="/event" className="btn-secondary inline-block">
        ← Back to Events
      </Link>
    </div>
  );
}
