import React from 'react'

function Hero() {
  return (
    <div className="px-4 mt-20 text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-900 mb-3">
          FrameIt
        </h1>
        <p className="text-lg text-blue-700 mb-6">
          See every angle of your event, shared by attendees.
        </p>
        <div className="flex justify-center mt-14 space-x-4">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium shadow-md hover:bg-blue-800 transform transition hover:scale-105">
            Create Event
          </button>
          <button className="bg-white text-blue-600 px-6 py-2 rounded-full font-medium shadow-md hover:bg-gray-100 transform transition hover:scale-105">
            Attend Event
          </button>
        </div>
      </div>
  )
}

export default Hero