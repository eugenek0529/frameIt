import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg';
import logo_close from '../assets/logo_close.svg'; 
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
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
          className="focus:outline-none text-lg"
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
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex flex-col justify-between z-20 p-8">
          {/* Top Section with Logo and Close Button */}
          <div>
            {/* Logo and Close Button Container */}
            <div className="flex justify-between items-center">
              {/* Logo in same position */}
              <Link to='/'>
              <img 
                src={logo_close} 
                alt="FrameIt Logo" 
                className="h-9 w-auto"
              />
              </Link>
              
              {/* Close button on right */}
              <button 
                onClick={toggleNavbar}
                className="text-2xl font-light text-white focus:outline-none"
              >
                X
              </button>
            </div>
            
            {/* User Section */}
            <div className="mt-6 space-y-4">
              {currentUser && (
                <h2 className="text-2xl font-light text-white">
                  Hello! {currentUser.displayName || currentUser.email}
                </h2>
              )}
            </div>
          </div>

          {/* Middle Section - Main Menu */}
          <div className="space-y-6 -mt-20">
            <Link 
              to="/create" 
              className="block text-2xl font-light text-white hover:text-blue-200"
              onClick={() => setIsOpen(false)}
            >
              Create new Event
            </Link>
            <Link 
              to="/my-events" 
              className="block text-2xl font-light text-white hover:text-blue-200"
              onClick={() => setIsOpen(false)}
            >
              My Events
            </Link>
            <Link 
              to="/attend" 
              className="block text-2xl font-light text-white hover:text-blue-200"
              onClick={() => setIsOpen(false)}
            >
              Attend an Event
            </Link>
            
          </div>

          {/* Bottom Section - Login/Signup/Logout Buttons */}
          <div className="flex justify-center space-x-4">
            {currentUser ? (
              <button
                onClick={handleLogout}
                className="bg-white text-black px-6 py-2 rounded-full font-medium shadow-md hover:bg-gray-200 transform transition hover:scale-105"
              >
                Log Out
              </button>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="bg-white text-black px-6 py-2 rounded-full font-medium shadow-md hover:bg-gray-200 transform transition hover:scale-105"
                  onClick={() => setIsOpen(false)}
                >
                  Log In
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-transparent text-white px-6 py-2 rounded-full font-medium shadow-md border-2 border-white hover:bg-white hover:text-black transform transition hover:scale-105"
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;