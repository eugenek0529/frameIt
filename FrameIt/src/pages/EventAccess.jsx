import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/firebase.config';
import { doc, getDoc } from 'firebase/firestore';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { verifyEventAccess } from '../firebase/firestore.event';

export default function EventAccess() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [eventId, setEventId] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [event, setEvent] = useState(null);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    let scanner;

    if (showScanner) {
      scanner = new Html5QrcodeScanner('reader', {
        qrbox: {
          width: 250,
          height: 250,
        },
        fps: 5,
      });

      scanner.render(handleQRCodeScan, handleQRError);
    }

    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, [showScanner]);

  const handleQRCodeScan = async (decodedText) => {
    try {
      // Assuming QR code contains the eventId
      const scannedEventId = decodedText;
      
      // Verify event exists and get access code
      const eventDoc = await getDoc(doc(db, 'events', scannedEventId));
      
      if (!eventDoc.exists()) {
        setError('Event not found');
        return;
      }

      // Set event data and move to access code step
      setEventId(scannedEventId);
      setEvent(eventDoc.data());
      setStep(2);
      setShowScanner(false);

    } catch (error) {
      setError('Failed to process QR code');
      console.error('QR code error:', error);
    }
  };

  const handleQRError = (error) => {
    console.warn('QR code error:', error);
  };

  const handleAccessCodeSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const isValid = await verifyEventAccess(eventId, accessCode);
      if (isValid) {
        // If verified, navigate directly to welcome page
        navigate(`/events/${eventId}/welcome`);
      } else {
        setError('Invalid access code');
      }
    } catch (err) {
      setError('Failed to verify access code');
      console.error('Access code error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white py-12">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {step === 1 ? 'Join Event' : 'Enter Access Code'}
          </h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {step === 1 ? (
              <>
                {/* QR Scanner Toggle */}
                <div className="flex justify-center">
                  <button
                    onClick={() => setShowScanner(!showScanner)}
                    className="text-indigo-600 hover:text-indigo-500"
                  >
                    {showScanner ? 'Enter ID Manually' : 'Scan QR Code'}
                  </button>
                </div>

                {showScanner ? (
                  // QR Scanner
                  <div id="reader" className="w-full"></div>
                ) : (
                  // Manual Input Form for Event ID
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="eventId" className="block text-sm font-medium text-gray-700 mb-2">
                        Event ID
                      </label>
                      <input
                        type="text"
                        id="eventId"
                        value={eventId}
                        onChange={(e) => setEventId(e.target.value)}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Enter the event ID"
                        required
                      />
                    </div>
                    <button
                      onClick={() => setStep(2)}
                      className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              // Access Code Form
              <form onSubmit={handleAccessCodeSubmit} className="space-y-4">
                <div>
                  <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Access Code
                  </label>
                  <input
                    type="text"
                    id="accessCode"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Enter the access code"
                    required
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700"
                  >
                    {loading ? 'Verifying...' : 'Join Event'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
