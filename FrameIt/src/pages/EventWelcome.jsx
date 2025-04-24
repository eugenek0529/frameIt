import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { getEventById, addAttendeeToEvent, checkAttendeeStatus } from '../firebase/firestore.event';
import { MapPinIcon, CalendarIcon, PhotoIcon, ArrowUpTrayIcon, UserPlusIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import JoinEventForm from '../components/JoinEventForm';

export default function EventWelcome() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [userStatus, setUserStatus] = useState({
    isAttendee: false,
    isCreator: false,
    loading: true
  });
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const fetchEventAndStatus = async () => {
      try {
        setLoading(true);
        // Fetch event data
        const eventData = await getEventById(eventId);
        setEvent(eventData);

        // Check user status
        if (currentUser) {
          // Check if user is creator
          const isCreator = eventData.creatorId === currentUser.uid;
          
          // Check if user is attendee
          const isAttendee = eventData.attendees?.some(
            attendee => attendee.userId === currentUser.uid
          );

          setUserStatus({
            isAttendee,
            isCreator,
            loading: false
          });
        } else {
          // For non-registered users, always show join button
          setUserStatus({
            isAttendee: false,
            isCreator: false,
            loading: false
          });
        }

        // Check for verified access
        const verifiedAccess = localStorage.getItem('verifiedEventAccess');
        if (!verifiedAccess) {
          // No verification found, redirect to access page
          navigate(`/events/${eventId}/access`);
          return;
        }

        const { eventId: verifiedEventId, timestamp } = JSON.parse(verifiedAccess);
        
        // Check if verification is for this event and not expired (e.g., 24 hours)
        const isValid = verifiedEventId === eventId && 
                       (new Date().getTime() - timestamp) < (24 * 60 * 60 * 1000);
        
        if (!isValid) {
          // Invalid or expired verification, redirect to access page
          navigate(`/events/${eventId}/access`);
          return;
        }

        // If we reach here, access is verified
        setHasAccess(true);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load event details');
        navigate(`/events/${eventId}/access`);
      } finally {
        setLoading(false);
      }
    };

    fetchEventAndStatus();
  }, [eventId, currentUser, navigate]);

  const handleJoinEvent = () => {
    setShowJoinForm(true);
  };

  const handleViewGallery = () => {
    navigate(`/events/${eventId}/gallery`);
  };

  const handleUploadImages = () => {
    navigate(`/events/${eventId}/upload`);
  };

  if (loading || userStatus.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white py-12">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header with back button */}
        <div className="px-4 py-3 flex justify-between items-center border-b bg-white">
          <button 
            onClick={() => navigate(-1)} 
            className="text-black p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        </div>

        {/* Cover Image */}
        <div className="relative w-full h-[400px]">
          {event?.coverImageUrl ? (
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
          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900">{event?.name}</h1>

          {/* Description */}
          <p className="text-gray-600 mt-4">{event?.description}</p>

          {/* Event Details */}
          <div className="space-y-6 mt-6">
            {/* Location and Date */}
            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-3">
                <MapPinIcon className="h-6 w-6 text-gray-400" />
                <span className="text-gray-600">{event?.location}</span>
              </div>
              <div className="flex items-center space-x-3">
                <CalendarIcon className="h-6 w-6 text-gray-400" />
                <span className="text-gray-600">
                  {event?.startTime && new Date(event.startTime).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>

            {/* Tags */}
            {Array.isArray(event?.tags) && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
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

            {/* Join Button - Show if not creator and not attendee */}
            {!userStatus.isCreator && !userStatus.isAttendee && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleJoinEvent}
                  className="flex items-center justify-center space-x-2 px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  <UserPlusIcon className="h-5 w-5" />
                  <span className="font-medium">Join Event</span>
                </button>
              </div>
            )}

            {/* Access Required Message - Show if no access */}
            {!hasAccess && (
              <div className="text-center py-6">
                <p className="text-gray-600">
                  Please verify your access to join this event.{' '}
                  <button 
                    onClick={() => navigate(`/events/${eventId}/access`)}
                    className="text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Verify Access
                  </button>
                </p>
              </div>
            )}

            {/* Action Buttons - Only show if has access */}
            {hasAccess && (
              <div className="flex justify-center space-x-4 pt-4">
                <button
                  onClick={handleViewGallery}
                  disabled={!userStatus.isCreator && !userStatus.isAttendee}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors duration-200 ${
                    userStatus.isCreator || userStatus.isAttendee
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <PhotoIcon className="h-5 w-5" />
                  <span className="font-medium">View Gallery</span>
                </button>

                <button
                  onClick={handleUploadImages}
                  disabled={!userStatus.isCreator && !userStatus.isAttendee}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors duration-200 ${
                    userStatus.isCreator || userStatus.isAttendee
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <ArrowUpTrayIcon className="h-5 w-5" />
                  <span className="font-medium">Upload Images</span>
                </button>
              </div>
            )}

            {/* Event Metadata */}
            <div className="text-sm text-gray-500 space-y-1 pt-4 border-t">
              <p>Created: {event?.createdAt?.toDate().toLocaleDateString()}</p>
              <p>Last Updated: {event?.updatedAt?.toDate().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Join Event Form Modal */}
      {showJoinForm && (
        <JoinEventForm
          eventId={eventId}
          onSubmit={async (attendeeData) => {
            try {
              await addAttendeeToEvent(eventId, attendeeData);
              setUserStatus(prev => ({ ...prev, isAttendee: true }));
              setShowJoinForm(false);
            } catch (error) {
              console.error('Error joining event:', error);
            }
          }}
          onClose={() => setShowJoinForm(false)}
          isOpen={showJoinForm}
        />
      )}
    </div>
  );
}
