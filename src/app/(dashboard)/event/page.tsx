import { getCurrentUser } from '@/actions/user';
import { getEvents, getMyEvents } from '@/actions/event';
import Link from 'next/link';
import JoinEventByIdButton from '@/components/JoinEventByIdButton';
import { formatUserDisplayName } from '@/lib/utils';

export default async function EventPage() {
  const user = await getCurrentUser();
  const allEvents = await getEvents();
  const myEvents = await getMyEvents();
  
  if (!user) {
    return null;
  }
  
  // Get IDs of events user has joined
  const joinedEventIds = new Set(myEvents.map(e => e.id));
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Events</h1>
        <Link
          href="/event/create"
          className="btn-primary"
        >
          + Create Event
        </Link>
      </div>

      {/* My Events */}
      {myEvents.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">My Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myEvents.map((event) => (
              <Link
                key={event.id}
                href={`/event/${event.id}`}
                className="card hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{event.name}</h3>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Joined
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{event.organization.name}</p>
                <div className="flex items-center text-sm text-gray-500 space-x-4">
                  <span>📍 {event.location}</span>
                  <span>👥 {event._count.participants}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All Events */}
      <div>
        <h2 className="text-2xl font-bold mb-4">All Events</h2>
        {allEvents.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-4xl mb-2">📅</p>
            <p className="text-gray-600">No events available</p>
            <p className="text-sm text-gray-500 mt-1">Create an event to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allEvents.map((event) => {
              const hasJoined = joinedEventIds.has(event.id);
              const isCreator = event.creator.id === user.id;
              
              return (
                <Link
                  key={event.id}
                  href={`/event/${event.id}`}
                  className="card hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{event.name}</h3>
                    {isCreator && (
                      <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded">
                        Creator
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{event.organization.name}</p>
                  <div className="flex items-center text-sm text-gray-500 space-x-4 mb-2">
                    <span>📍 {event.location}</span>
                    <span>👥 {event._count.participants}</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    By {formatUserDisplayName(event.creator.name, event.creator.userNumber)}
                  </p>
                  {!hasJoined && !isCreator && (
                    <JoinEventByIdButton eventId={event.id} />
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
