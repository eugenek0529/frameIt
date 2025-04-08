import React, { useState } from 'react';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Hamburger Button - Always visible */}
      <button
        onClick={toggleNavbar}
        className="absolute top-4 right-4 z-30 focus:outline-none text-blue-900"
      >
        {/* Conditionally render burger or close icon */}
        <i className={`fa-solid ${isOpen ? 'fa-xmark' : 'fa-bars'} fa-lg`}></i>
      </button>

      {/* Full-screen Overlay Menu */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-white flex flex-col items-center justify-between z-20 p-8" // Full screen, white background, space-between
        >
          {/* Top Section - Menu Links */}
          <div className="mt-20 text-center space-y-4"> {/* Reduced spacing */}
            <a href="#" className="block py-1 text-blue-700 text-lg hover:text-blue-900">About FrameIt</a>
            <a href="#" className="block py-1 text-blue-700 text-lg hover:text-blue-900">Create Event</a>
            <a href="#" className="block py-1 text-blue-700 text-lg hover:text-blue-900">Manage Event</a>
            <a href="#" className="block py-1 text-blue-700 text-lg hover:text-blue-900">Attend Event</a>
          </div>

          {/* Bottom Section - Login/Signup Buttons */}
          <div className="flex justify-center space-x-4">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium shadow-md hover:bg-blue-700 transform transition hover:scale-105">
              Log In
            </button>
            <button className="bg-white text-blue-600 px-6 py-2 rounded-full font-medium shadow-md hover:bg-blue-700 transform transition hover:scale-105">
              Sign Up
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;