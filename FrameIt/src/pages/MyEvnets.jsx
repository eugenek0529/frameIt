// src/pages/MyEvents.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/firebase.config';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { CalendarIcon, UserGroupIcon, MapPinIcon } from '@heroicons/react/24/outline';

export default function MyEvents() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState({
    created: [],
    attending: [],
    past: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserEvents = async () => {
      try {
        setLoading(true);
        
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          throw new Error('User document not found');
        }

        const userData = userDoc.data();
        const myEvents = userData.myEvents || [];
        const now = new Date();

        const createdEvents = [];
        const attendingEvents = [];
        const pastEvents = [];

        // Get full event details for each event
        for (const eventRef of myEvents) {
          const eventDoc = await getDoc(doc(db, 'events', eventRef.eventId));
          if (eventDoc.exists()) {
            const eventData = {
              id: eventDoc.id,
              ...eventDoc.data(),
              role: eventRef.role,
              joinedAt: eventRef.joinedAt
            };

            const eventDate = new Date(eventData.startTime);
            
            // Sort into appropriate arrays based on date and role
            if (eventDate < now) {
              pastEvents.push(eventData);
            } else if (eventRef.role === 'creator') {
              createdEvents.push(eventData);
            } else {
              attendingEvents.push(eventData);
            }
          }
        }

        // Sort events by date
        const sortByDate = (a, b) => new Date(a.startTime) - new Date(b.startTime);
        
        setEvents({
          created: createdEvents.sort(sortByDate),
          attending: attendingEvents.sort(sortByDate),
          past: pastEvents.sort((a, b) => new Date(b.startTime) - new Date(a.startTime)) // Past events sorted newest first
        });
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchUserEvents();
    }
  }, [currentUser]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Date not set';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const EventCard = ({ event }) => (
    <div
      onClick={() => navigate(`/events/${event.id}`)}
      className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer overflow-hidden flex h-32 w-full"
    >
      {/* Image Section */}
      <div className="w-36 h-32 flex-shrink-0">
        {event.coverImageUrl ? (
          <img
            src={event.coverImageUrl}
            alt={event.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-sm">No image</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-semibold text-gray-900 truncate">{event.name}</h3>
            <span className={`flex-shrink-0 text-xs px-2 py-1 rounded ${
              event.role === 'creator' 
                ? 'bg-indigo-100 text-indigo-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {event.role === 'creator' ? 'Creator' : 'Attendee'}
            </span>
          </div>
          
          <div className="mt-1 flex items-center text-sm text-gray-500">
            <CalendarIcon className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="truncate">{formatDate(event.startTime)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center min-w-0 mr-2">
            <MapPinIcon className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center flex-shrink-0">
            <UserGroupIcon className="h-4 w-4 mr-1" />
            <span>{event.attendees?.length || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const EventSection = ({ title, events, emptyMessage }) => (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <p className="text-gray-600">{emptyMessage}</p>
      )}
    </div>
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-600">Loading your events...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-red-600">{error}</div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Events</h1>

      {/* Upcoming Events I Created */}
      <EventSection
        title="Events I Created"
        events={events.created}
        emptyMessage="You haven't created any events yet."
      />

      {/* Upcoming Events I'm Attending */}
      <EventSection
        title="Events I'm Attending"
        events={events.attending}
        emptyMessage="You're not attending any upcoming events."
      />

      {/* Past Events */}
      <EventSection
        title="Past Events"
        events={events.past}
        emptyMessage="No past events."
      />
    </div>
  );
}