import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { db } from '../firebase/firebase.config';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';

import { MapPinIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { getEventById, deleteEvent } from '../firebase/firestore.event';

export default function EventDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        console.log('Fetching event with ID:', eventId); // Debug log
        const eventDoc = await getDoc(doc(db, 'events', eventId));
        
        if (eventDoc.exists()) {
          const eventData = { id: eventDoc.id, ...eventDoc.data() };
          console.log('Event data:', eventData); // Debug log
          setEvent(eventData);
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
  }, [eventId]);

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

  const isCreator = currentUser && event.creatorId === currentUser.uid;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white py-12">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 flex justify-between items-center border-b bg-white">
          <button 
            onClick={() => navigate(-1)} 
            className="text-black p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          {isCreator && (
            <div className="flex space-x-2">
              <button
                onClick={handleEdit}
                className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Cover Image */}
        <div className="relative w-full h-[400px]">
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
        <div className="p-4 space-y-4">
          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>

          {/* Description */}
          <p className="text-gray-600">{event.description}</p>

          {/* Location and Date */}
          <div className="flex flex-col space-y-3 mt-6">
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
          {Array.isArray(event.tags) && event.tags.length > 0 && (
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

          {/* Creator Actions */}
          {currentUser && event.creatorId === currentUser.uid && (
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => navigate(`/events/edit/${event.id}`)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Edit Event
              </button>
              <button
                onClick={() => {/* Add delete handler */}}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Delete Event
              </button>
            </div>
          )}
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
    </div>
  );
}