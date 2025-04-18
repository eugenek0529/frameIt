import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase/firebase.config';
import { doc, getDoc } from 'firebase/firestore';
import { MapPinIcon, CalendarIcon } from '@heroicons/react/24/outline';

export default function EventDetails() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const eventDoc = await getDoc(doc(db, 'events', eventId));
        if (eventDoc.exists()) {
          setEvent({ id: eventDoc.id, ...eventDoc.data() });
        } else {
          setError('Event not found');
        }
      } catch (err) {
        setError('Failed to fetch event details');
        console.error('Error fetching event:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!event) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white py-12">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        
        {/* Cover Image */}
        <div className="relative w-full h-[300px]">
          {event.coverImageUrl ? (
            <img 
              src={event.coverImageUrl} 
              alt={event.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No cover image</span>
            </div>
          )}          
        </div>

        {/* Event Details */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>

          {/* Description */}
          <p className="text-gray-600">{event.description}</p>

          {/* Location and Date */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-3">
              <MapPinIcon className="h-6 w-6 text-gray-400" />
              <span className="text-gray-600">{event.location}</span>
            </div>
            <div className="flex items-center space-x-3">
              <CalendarIcon className="h-6 w-6 text-gray-400" />
              <span className="text-gray-600">
                {new Date(event.startTime).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {event.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}