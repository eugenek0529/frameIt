import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/firebase.config';
import { doc, getDoc } from 'firebase/firestore';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function EventAccess() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [eventId, setEventId] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [event, setEvent] = useState(null);
  const [showScanner, setShowScanner] = useState(false);

  // For development: Sample QR codes
  const devSampleEvents = [
    { id: 'test-event-1', name: 'Test Event 1', accessCode: '1234' },
    { id: 'test-event-2', name: 'Test Event 2', accessCode: '5678' },
  ];

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

      scanner.render(success, error);

      function success(result) {
        scanner.clear();
        verifyEventId(result);
      }

      function error(err) {
        console.warn(err);
      }
    }

    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, [showScanner]);

  const verifyEventId = async (idToVerify) => {
    setError('');
    setLoading(true);
    setShowScanner(false);

    try {
      // For development: Check if it's a test event
      const testEvent = devSampleEvents.find(e => e.id === idToVerify);
      if (testEvent) {
        setEvent(testEvent);
        setEventId(idToVerify);
        setStep(2);
        return;
      }

      const eventDoc = await getDoc(doc(db, 'events', idToVerify));
      
      if (!eventDoc.exists()) {
        setError('Event not found. Please check the Event ID.');
        return;
      }

      const eventData = eventDoc.data();
      setEvent(eventData);
      setEventId(idToVerify);
      setStep(2);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to find event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyAccessCode = async () => {
    setError('');
    setLoading(true);

    try {
      // For development: Check if it's a test event
      const testEvent = devSampleEvents.find(e => e.id === eventId);
      if (testEvent && accessCode === testEvent.accessCode) {
        navigate(`/events/${eventId}/welcome`);
        return;
      }

      if (accessCode === event.accessCode) {
        navigate(`/events/${eventId}/welcome`);
      } else {
        setError('Invalid access code. Please try again.');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) {
      await verifyEventId(eventId);
    } else {
      await verifyAccessCode();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white py-12">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {step === 1 ? 'Join Event' : 'Enter Access Code'}
          </h2>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className={`h-1 w-24 rounded ${step === 1 ? 'bg-indigo-600' : 'bg-indigo-200'}`} />
            <div className={`h-1 w-24 rounded ${step === 2 ? 'bg-indigo-600' : 'bg-indigo-200'}`} />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
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
                // Manual Input Form
                <form onSubmit={handleSubmit} className="space-y-4">
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
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700"
                  >
                    {loading ? 'Verifying...' : 'Next'}
                  </button>
                </form>
              )}

              {/* Development Mode: Test Events */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-8 p-4 bg-gray-50 rounded-md">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Development Test Events:</h3>
                  <div className="space-y-2">
                    {devSampleEvents.map((testEvent) => (
                      <div key={testEvent.id} className="text-sm">
                        <button
                          onClick={() => verifyEventId(testEvent.id)}
                          className="text-indigo-600 hover:text-indigo-500"
                        >
                          {testEvent.name}
                        </button>
                        <span className="text-gray-500 ml-2">
                          (ID: {testEvent.id}, Code: {testEvent.accessCode})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-6">
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
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  {loading ? 'Verifying...' : 'Join Event'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
