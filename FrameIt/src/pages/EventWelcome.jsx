import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById } from '../firebase/firestore.event';
import { MapPinIcon, CalendarIcon, PhotoIcon, ArrowUpTrayIcon, UserIcon } from '@heroicons/react/24/outline';

export default function EventWelcome() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventData = await getEventById(eventId);
        setEvent(eventData);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleJoinEvent = () => {
    console.log('Joining event:', event.id);
  };

  const ActionButton = ({ icon: Icon, label, onClick, disabled = false }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center justify-center space-x-3
        w-full px-6 py-4 rounded-xl
        transition-all duration-200 ease-in-out
        ${disabled 
          ? 'bg-gray-50 text-gray-400 cursor-not-allowed' 
          : `
            bg-white text-gray-800
            hover:bg-gray-50 hover:shadow-md
            active:transform active:scale-[0.99]
            border-2 border-gray-100
          `
        }
      `}
    >
      <Icon className="h-6 w-6" />
      <span className="font-medium text-base">{label}</span>
      {disabled && (
        <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">Coming Soon</span>
      )}
    </button>
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-red-600">{error}</div>
    </div>
  );

  if (!event) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white py-12">
      <div className="max-w-2xl mx-auto">
        {/* Main Content Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-4">
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

          <div className="p-6">
            {/* Welcome Message */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to {event.name}!
              </h1>
              {event.welcomeMessage && (
                <p className="text-lg text-gray-600">
                  {event.welcomeMessage}
                </p>
              )}
            </div>

            {/* Event Details */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Details</h2>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <MapPinIcon className="h-6 w-6 text-gray-400" />
                    <span className="text-gray-600">{event.location}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CalendarIcon className="h-6 w-6 text-gray-400" />
                    <span className="text-gray-600">
                      {new Date(event.startTime).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {event.description && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Event</h2>
                  <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
                </div>
              )}

              {/* Tags */}
              {Array.isArray(event.tags) && event.tags.length > 0 && (
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

              {/* Join Event Button - Centered */}
              <div className="flex justify-center py-6">
                <button
                  onClick={handleJoinEvent}
                  className="flex items-center justify-center space-x-2 px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  <UserIcon className="h-5 w-5" />
                  <span className="font-medium">Join Event</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => {}}
                  disabled={true}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PhotoIcon className="h-5 w-5" />
                  <span>View Gallery</span>
                </button>
                <button
                  onClick={() => {}}
                  disabled={true}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowUpTrayIcon className="h-5 w-5" />
                  <span>Upload Photos</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
