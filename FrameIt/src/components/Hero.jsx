import React from 'react'
import nameImage from '../assets/name.png'
import create_image_btn from '../assets/create_event_btn.svg'
import attend_event_btn from '../assets/attend_event_btn.svg'
import { Link } from 'react-router-dom'

function Hero() {
  return (
    <div className="px-4 mt-20 text-center mb-8">
        <img 
          src={nameImage}
          alt="FrameIt Hero" 
          className="mx-auto mb-6 max-w-full h-auto"
        />
        <p className="text-lg  mb-6">
          See every angle of your event, shared by attendees.
        </p>
        <div className="flex justify-center mt-14 space-x-4">
          <Link to='/create'>
            <button className="transform transition-all duration-200 hover:scale-105 active:scale-95 hover:opacity-90">
                <img src={create_image_btn} alt="Create Event" className='h-10 w-auto' />
            </button>
          </Link>
          <button className="transform transition-all duration-200 hover:scale-105 active:scale-95 hover:opacity-90">
              <img src={attend_event_btn} alt="Attend Event" className='h-10 w-auto' />
          </button>
        </div>
      </div>
  )
}

export default Hero