import React from 'react'
//import { roomsDummyData } from '../assets/assets'
import HotelCard from './HotelCard'
import Title from './Title'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'

const FeaturedDestination = () => {
  const {rooms, navigate} = useAppContext();
  //const navigate = useNavigate();

  return  rooms.length > 0 && (
    <div className='flex flex-wrap items-center justify-center px-6 md:px-16 lg:px-24 bg-slate-50 py-20 gap-6'>
      <Title 
        title='Featured Destination' 
        subTitle='Discover our handpicked selection of exceptional properties around the world, offering unparalleled luxury and unforgettable experiences.' 
      />

      <div className="w-full flex flex-wrap justify-center gap-6">
        {rooms.slice(0, 4).map((room, index) => (
          <div key={room._id} className="w-full sm:w-1/3 lg:w-1/5 px-2">
            <HotelCard room={room} index={index} />
          </div>
        ))}
      </div>
      <button onClick={()=>{navigate("/rooms"); scrollTo(0, 0)}} className='my-16 px-4 py-2 text-sm font-medium border border-gray-300 rounded bg-white hover:bg-gray-50 transition-all
      cursor pointer'>
        View All Destination
      </button>
    </div>
  )
}

export default FeaturedDestination