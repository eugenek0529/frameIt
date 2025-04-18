import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/firebase.config';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function MyEvents() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserEvents = async () => {
      try {
        const eventsQuery = query(
          collection(db, 'events'),
          where('creatorId', '==', currentUser.uid)
        );

        const querySnapshot = await getDocs(eventsQuery);
        const eventsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setEvents(eventsData);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchUserEvents();
  }, [currentUser]);

  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  const getDaysRemaining = (startTime) => {
    const today = new Date();
    const eventDate = new Date(startTime);
    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const sortedEvents = events.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  const upcomingEvents = sortedEvents.filter(event => getDaysRemaining(event.startTime) >= 0);
  const pastEvents = sortedEvents.filter(event => getDaysRemaining(event.startTime) < 0);

  const EventCard = ({ event }) => {
    const daysRemaining = getDaysRemaining(event.startTime);
    const isUpcoming = daysRemaining >= 0;

    return (
      <div
        onClick={() => handleEventClick(event.id)}
        className="rounded-lg shadow-md overflow-hidden cursor-pointer transition transform hover:scale-105 bg-white bg-opacity-70 backdrop-filter backdrop-blur-md"
      >
        <div className="h-32 bg-gray-200">
          {event.coverImageUrl ? (
            <img
              src={event.coverImageUrl}
              alt={event.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-200 to-indigo-200 bg-opacity-50">
              <span className="text-gray-500">No image</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-1 truncate">
            {event.name}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            {new Date(event.startTime).toLocaleDateString()}
          </p>
          <div className={`text-sm ${isUpcoming ? 'text-green-700' : 'text-red-700'}`}>
            {isUpcoming
              ? `${daysRemaining} days remaining`
              : `${Math.abs(daysRemaining)} days ago`
            }
          </div>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-center">
          <p className="text-lg text-gray-700">Loading your events...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
          <button
            onClick={() => navigate('/create')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full text-sm font-medium focus:outline-none focus:shadow-outline"
          >
            Create New Event
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 bg-opacity-80 backdrop-filter backdrop-blur-md">
            {error}
          </div>
        )}

        {/* Upcoming Events */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Events</h2>
          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {upcomingEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No upcoming events</p>
          )}
        </div>

        {/* Past Events */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Past Events</h2>
          {pastEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {pastEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No past events</p>
          )}
        </div>
      </div>
    </div>
  );
}