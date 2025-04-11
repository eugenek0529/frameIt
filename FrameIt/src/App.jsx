import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Hero from './components/Hero';
import Navbar from './components/Navbar';
import Features from './components/Features';
import SignUp from './pages/Signup';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <div 
        className="min-h-screen flex flex-col bg-gradient-to-b from-blue-100 to-white"
        style={{
          backgroundImage: "url('blue-background.png')",
          backgroundSize: 'cover',       // Cover the entire container
          backgroundRepeat: 'no-repeat', // Prevent image repetition
          backgroundPosition: 'center',   // Center the image
        }}
        >
        <Navbar />

        <Routes>
          <Route path="/" element={
            <>
              <header className="flex-grow flex items-center justify-center pt-20 md:pt-32"> {/* Removed md:justify-start */}
                <Hero />
              </header>
              <Features />
            </>
          } />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
        </Routes>

        {/* Footer */}
        <footer className="py-6 text-center text-gray-500 text-xs">
          <p>© 2024 FrameIt. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;