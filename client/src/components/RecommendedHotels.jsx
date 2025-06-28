import React from 'react';
import HotelCard from './HotelCard';
import Title from './Title';
import { useAppContext } from '../context/AppContext';

const RecommendedHotels = () => {
  const { rooms, selectedDestination } = useAppContext();

  // Filter rooms by selectedDestination and available status
  const filteredRooms = rooms.filter((room) => {
    const matchesDestination = selectedDestination
      ? room.hotel.city?.toLowerCase() === selectedDestination.toLowerCase()
      : true;
    const isAvailable = room.isAvailable !== false; // assuming backend provides this
    return matchesDestination && isAvailable;
  });

  return filteredRooms.length > 0 ? (
    <div className='flex flex-wrap items-center justify-center px-6 md:px-16 lg:px-24 bg-slate-50 py-20 gap-6'>
      <Title 
        title='Recommended Hotels' 
        subTitle='Stay at the most popular hotels in your selected destination'
      />

      <div className="w-full flex flex-wrap justify-center gap-6">
        {filteredRooms.slice(0, 4).map((room, index) => (
          <div key={room._id} className="w-full sm:w-1/3 lg:w-1/5 px-2">
            <HotelCard room={room} index={index} />
          </div>
        ))}
      </div>
    </div>
  ) : null;
};

export default RecommendedHotels;
