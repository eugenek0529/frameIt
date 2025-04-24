import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Hero from './components/Hero';
import Navbar from './components/Navbar';
import Features from './components/Features';
import SignUp from './pages/Signup';
import Login from './pages/Login';
import { PrivateRoute } from './routes/PrivateRoute';
import CreateEvent from './pages/CreateEvent';
import EventDetails from './pages/EventDetails';
import EditEvent from './pages/EditEvent';
import MyEvents from './pages/MyEvnets';
import EventAccess from './pages/EventAccess';
import EventWelcome from './pages/EventWelcome';
import EventImageUpload from './pages/EventImageUpload';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-100 to-white">
          <Navbar />

          <Routes>
            {/* Public routes */}
            <Route path="/" element={
              <>
                <header className="flex-grow flex items-center justify-center pt-20 md:pt-32">
                  <Hero />
                </header>
                <Features />
              </>
            } />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/events/:eventId" element={<EventDetails />} />
            <Route path="/attend" element={<EventAccess />} />
            <Route path="/events/:eventId/welcome" element={<EventWelcome />} />
            <Route path='/events/:eventId/upload' element={<EventImageUpload />} />

            {/* Protected routes */}
            <Route
              path="/create"
              element={
                <PrivateRoute>
                  <CreateEvent />
                </PrivateRoute>
              }
            /> 
            <Route
              path="/events/edit/:eventId"
              element={
                <PrivateRoute>
                  <EditEvent />
                </PrivateRoute>
              }
            /> 
            <Route
              path="/my-events"
              element={
                <PrivateRoute>
                  <MyEvents />
                </PrivateRoute>
              }
            /> 
          </Routes>

          {/* Footer */}
          <footer className="py-6 text-center text-gray-500 text-xs">
            <p>© 2024 FrameIt. All rights reserved.</p>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;