import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createEvent } from '../firebase/firestore.event.js';

const DEFAULT_CAPACITY = 30;

export default function CreateEvent() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    tags: '',
    location: '',
    startTime: '',
    accessCode: '',
    welcomeMessage: '',
    description: '',
    capacity: DEFAULT_CAPACITY,
  });
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      if (!formData.name || !formData.location || !formData.startTime) {
        setError('Please fill in all required fields.');
        setLoading(false);
        return;
      }

      const newEvent = await createEvent(
        formData,
        coverImageFile,
        currentUser.uid
      );

      setSuccess('Event created successfully!');
      
      // Navigate to the new event's page
      setTimeout(() => {
        navigate(`/events/${newEvent.id}`);
      }, 1500);

    } catch (err) {
      console.error('Error:', err);
      setError('Failed to create event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white py-12">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden md:max-w-2xl">
        <div className="p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Create Your Event</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline">{error}</span>
            </div>}
            {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Success!</strong>
              <span className="block sm:inline">{success}</span>
            </div>}

            {/* Event Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Event Name <span className="text-red-500">*</span></label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3" placeholder="Give your event a catchy name" />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags <span className="text-gray-500">(optional, comma separated)</span></label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input type="text" id="tags" name="tags" value={formData.tags} onChange={handleChange} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3" placeholder="e.g., party, workshop, conference" />
              </div>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">Event Location <span className="text-red-500">*</span></label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} required className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3" placeholder="Enter address or online link" />
              </div>
            </div>

            {/* Date and Time */}
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Start Time <span className="text-red-500">*</span></label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="datetime-local"
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3"
                />
              </div>
            </div>

            {/* Access Code */}
            <div>
              <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700">Access Code <span className="text-gray-500">(optional)</span></label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input type="text" id="accessCode" name="accessCode" value={formData.accessCode} onChange={handleChange} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3" placeholder="Optional code for private events" />
              </div>
            </div>

            {/* Welcome Message */}
            <div>
              <label htmlFor="welcomeMessage" className="block text-sm font-medium text-gray-700">Welcome Message <span className="text-gray-500">(optional)</span></label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input type="text" id="welcomeMessage" name="welcomeMessage" value={formData.welcomeMessage} onChange={handleChange} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3" placeholder="A friendly message for attendees" />
              </div>
            </div>

            {/* Cover Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Cover Image <span className="text-gray-500">(optional)</span></label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <label htmlFor="coverImage" className="relative cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 w-full flex items-center">
                  <span>{coverImageFile ? "Change Cover Image" : "Upload Cover Image"}</span>
                  <input id="coverImage" type="file" accept="image/*" onChange={e => setCoverImageFile(e.target.files[0])} className="sr-only" />
                </label>
                {coverImageFile && (
                  <div className="mt-2">
                    <img src={URL.createObjectURL(coverImageFile)} alt="Cover Preview" className="h-24 rounded shadow object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description <span className="text-gray-500">(optional)</span></label>
              <div className="mt-1">
                <textarea id="description" name="description" rows={3} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3" placeholder="Provide more details about your event..." value={formData.description} onChange={handleChange} />
              </div>
            </div>

            {/* Capacity */}
            <div className="opacity-50">
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">Capacity (Max {DEFAULT_CAPACITY})</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input type="number" id="capacity" name="capacity" value={formData.capacity} disabled className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 bg-gray-100 cursor-not-allowed" />
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button type="submit" disabled={loading} className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {loading ? 'Creating Event...' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}