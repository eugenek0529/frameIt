import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById, deleteEvent } from '../firebase/firestore.event';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase.config';
import { MapPinIcon, CalendarIcon, QrCodeIcon, ArrowDownTrayIcon, PencilIcon, TrashIcon, PhotoIcon, ArrowUpTrayIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

export default function EventDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [success, setSuccess] = useState(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [showAttendees, setShowAttendees] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        console.log('Fetching event with ID:', eventId); // Debug log
        const eventDoc = await getDoc(doc(db, 'events', eventId));
        
        if (eventDoc.exists()) {
          const eventData = { id: eventDoc.id, ...eventDoc.data() };
          console.log('Debug creator check:', {
            currentUserId: currentUser?.uid,
            eventCreatorId: eventData.creatorId,
            isMatch: currentUser?.uid === eventData.creatorId
          });
          console.log('Event data:', eventData); // Debug log
          setEvent(eventData);
          setIsCreator(currentUser && eventData.creatorId === currentUser.uid);
        } else {
          setError('Event not found');
        }
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to fetch event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId, currentUser]);

  const handleEdit = () => {
    navigate(`/events/edit/${eventId}`, { state: { event } });
  };

  const extractImagePathFromUrl = (url) => {
    try {
      // Firebase Storage URLs contain a path after /o/
      const urlPath = url.split('/o/')[1];
      // The path is URL encoded and includes query parameters
      const imagePath = decodeURIComponent(urlPath.split('?')[0]);
      return imagePath;
    } catch (error) {
      console.error('Error extracting image path:', error);
      return null;
    }
  };

  const handleDelete = async () => {
    try {
      await deleteEvent(eventId);
      navigate('/events');
    } catch (err) {
      setError('Failed to delete event');
    }
  };

  const handleQRDownload = async () => {
    if (!event?.qrCodeUrl) return;
    setDownloadLoading(true);

    try {
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = event.qrCodeUrl;
      link.download = `${event.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-qr-code.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading QR code:', error);
      setError('Failed to download QR code');
      
      // Fallback: Open in new tab
      window.open(event.qrCodeUrl, '_blank');
    } finally {
      setDownloadLoading(false);
    }
  };

  // Add this function to copy QR code URL
  const handleCopyQRUrl = async () => {
    try {
      await navigator.clipboard.writeText(event.qrCodeUrl);
      // You could add a temporary success message here
    } catch (error) {
      setError('Failed to copy QR code URL');
    }
  };

  // Delete confirmation modal
  const DeleteModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Delete Event</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this event? This action cannot be undone.
          {event.coverImageUrl && (
            <span className="block mt-2 text-sm text-red-500">
              This will also delete the event's images.
            </span>
          )}
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              handleDelete();
              setShowDeleteModal(false);
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  // Add success message display
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [success]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!event) return null;

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

            {/* Gallery and Upload Buttons - Main Actions */}
            <div className="flex justify-center space-x-4 pt-4">
              <button
                onClick={() => navigate(`/events/${event.id}/gallery`)}
                className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                <PhotoIcon className="h-5 w-5" />
                <span className="font-medium">View Gallery</span>
              </button>

              <button
                onClick={() => navigate(`/events/${event.id}/upload`)}
                className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                <ArrowUpTrayIcon className="h-5 w-5" />
                <span className="font-medium">Upload Images</span>
              </button>
            </div>

            {/* QR Code Toggle Section - For Creator Only */}
            {isCreator && (
              <div className="w-full">
                <button
                  onClick={() => setShowQRCode(!showQRCode)}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all duration-200"
                >
                  <QrCodeIcon className="h-6 w-6 text-indigo-600" />
                  <span className="text-indigo-600 font-medium">
                    {showQRCode ? 'Hide Access Information' : 'Show Access Information'}
                  </span>
                </button>

                {/* Access Code, Event ID, and QR Code Section with Animation */}
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    showQRCode ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      {/* Access Information */}
                      <div className="space-y-4">
                        {/* Event ID */}
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Event ID</h3>
                          <div className="mt-1 bg-white inline-block px-3 py-2 rounded-md border border-gray-200">
                            <span className="font-mono text-sm text-gray-800">
                              {event?.id}
                            </span>
                          </div>
                        </div>

                        {/* Access Code */}
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Access Code</h3>
                          <div className="mt-1 bg-white inline-block px-4 py-2 rounded-md border-2 border-indigo-100">
                            <span className="text-2xl font-mono font-bold text-indigo-600 tracking-wider">
                              {event?.accessCode}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            Share this code with your attendees
                          </p>
                        </div>
                      </div>

                      {/* QR Code */}
                      {event?.qrCodeUrl && (
                        <div className="flex flex-col items-center">
                          <div className="bg-white p-3 rounded-lg shadow-sm mb-2">
                            <img 
                              src={event.qrCodeUrl} 
                              alt="Event QR Code" 
                              className="w-32 h-32"
                            />
                          </div>
                          <button
                            onClick={handleQRDownload}
                            disabled={downloadLoading}
                            className={`
                              flex items-center space-x-2 px-4 py-2 
                              bg-white border border-gray-300 rounded-md 
                              text-gray-700 hover:bg-gray-50 
                              transition-colors duration-200
                              ${downloadLoading ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                          >
                            {downloadLoading ? (
                              <span>Downloading...</span>
                            ) : (
                              <>
                                <ArrowDownTrayIcon className="h-5 w-5" />
                                <span>Download QR Code</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Attendees Information Toggle (new) */}
            <div className="w-full">
              <button
                onClick={() => setShowAttendees(!showAttendees)}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all duration-200"
              >
                <UserGroupIcon className="h-6 w-6 text-indigo-600" />
                <span className="text-indigo-600 font-medium">
                  {showAttendees ? 'Hide Attendees Information' : 'Show Attendees Information'}
                </span>
              </button>

              {/* Attendees Info Content */}
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  showAttendees ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">
                        Attendees ({event?.attendees?.length || 0})
                      </h3>
                    </div>

                    {event?.attendees && event.attendees.length > 0 ? (
                      <div className="divide-y divide-gray-200">
                        {event.attendees.map((attendee, index) => (
                          <div key={index} className="py-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-sm font-medium text-gray-900">
                                  {attendee.name}
                                </h4>
                                <p className="text-sm text-gray-500">{attendee.email}</p>
                                <span className="text-xs text-gray-400">
                                  Relationship: {attendee.relationship}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-xs text-gray-400">
                                  Joined: {new Date(attendee.joinedAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">
                        No attendees have joined yet
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Creator Actions - Smaller, more subtle styling */}
            {isCreator && (
              <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
                <button
                  onClick={() => navigate(`/events/edit/${event.id}`)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors duration-200"
                >
                  <PencilIcon className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded hover:bg-red-50 transition-colors duration-200"
                >
                  <TrashIcon className="h-4 w-4" />
                  <span>Delete</span>
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

        {/* Add success message display */}
        {success && (
          <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && <DeleteModal />}
      </div>

      {/* Show error message if download fails */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}