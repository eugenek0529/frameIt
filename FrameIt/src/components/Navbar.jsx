import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.svg';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Container for logo and hamburger - will scroll with page */}
      <div className="relative w-full px-8 pt-8 flex justify-between items-center">
        {/* Logo */}
        <Link to="/">
          <img 
            src={logo} 
            alt="FrameIt Logo" 
            className="h-9 w-auto"
          />
        </Link>

        {/* Hamburger Button */}
        <button
          onClick={toggleNavbar}
          className="focus:outline-none text-blue-900 text-lg"
        >
          {isOpen ? (
            <i className="fas fa-times fa-xl"></i>
          ) : (
            <i className="fas fa-bars fa-xl"></i>
          )}
        </button>
      </div>

      {/* Full-screen Overlay Menu */}
      {isOpen && (
        <div className="fixed inset-0 bg-white flex flex-col items-center justify-between z-20 p-8">
          {/* Rest of your menu code... */}
          <div className="mt-24 text-center space-y-4">
            <Link 
              to="/" 
              className="block py-1 text-blue-700 text-lg hover:text-blue-900"
              onClick={() => setIsOpen(false)}
            >
              About FrameIt
            </Link>
            <Link 
              to="/create" 
              className="block py-1 text-blue-700 text-lg hover:text-blue-900"
              onClick={() => setIsOpen(false)}
            >
              Create Event
            </Link>
            <Link 
              to="/manage" 
              className="block py-1 text-blue-700 text-lg hover:text-blue-900"
              onClick={() => setIsOpen(false)}
            >
              Manage Event
            </Link>
            <Link 
              to="/attend" 
              className="block py-1 text-blue-700 text-lg hover:text-blue-900"
              onClick={() => setIsOpen(false)}
            >
              Attend Event
            </Link>
          </div>

          <div className="flex justify-center space-x-4">
            <Link 
              to="/login" 
              className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium shadow-md hover:bg-blue-700 transform transition hover:scale-105"
              onClick={() => setIsOpen(false)}
            >
              Log In
            </Link>
            <Link 
              to="/signup" 
              className="bg-white text-blue-600 px-6 py-2 rounded-full font-medium shadow-md hover:bg-blue-700 hover:text-white transform transition hover:scale-105"
              onClick={() => setIsOpen(false)}
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;