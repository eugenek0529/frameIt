import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function EventImageUpload() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const MAX_IMAGES = 5;

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    const availableSlots = MAX_IMAGES - selectedFiles.length;
    const newFiles = imageFiles.slice(0, availableSlots);

    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const removeImage = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => navigate(`/events/${eventId}/welcome`)}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <h1 className="ml-4 text-xl font-semibold text-gray-900">Upload Your Best Moments</h1>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 p-4 border-b">
          <div className="mx-auto">
            <h2 className="text-lg font-medium text-blue-800 mb-2">Share Your Favorite Moments</h2>
            <p className="text-blue-600">
              Choose up to 5 of your best photos that capture the event's special moments.
              Make each photo count! 📸✨
            </p>
          </div>
        </div>

        {/* Upload Area */}
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Image Counter */}
          <div className="mb-4 text-center">
            <span className="text-lg font-medium">
              {selectedFiles.length} / {MAX_IMAGES} Images Selected
            </span>
          </div>

          {/* File Input */}
          {selectedFiles.length < MAX_IMAGES && (
            <div className="flex justify-center items-center w-full mb-6">
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <PhotoIcon className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 10MB each</p>
                  <p className="text-sm text-indigo-600 mt-2">
                    {MAX_IMAGES - selectedFiles.length} slots remaining
                  </p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  multiple 
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </label>
            </div>
          )}

          {/* Selected Images Preview */}
          {selectedFiles.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Selected Images</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative aspect-square group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => navigate(`/events/${eventId}/welcome`)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              disabled={selectedFiles.length === 0 || uploading}
              className={`px-4 py-2 rounded-md text-white font-medium
                ${selectedFiles.length === 0 || uploading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {uploading ? 'Uploading...' : 'Upload Images'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
