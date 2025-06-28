import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { assets, facilityIcons, roomCommonData } from '../assets/assets';
import StarRating from '../components/StarRating';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const RoomDetails = () => {
  const { id } = useParams();
  const { rooms, axios, getToken, navigate } = useAppContext();

  const [room, setRoom] = useState(null);
  const [mainImage, setMainImage] = useState(null);

  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState(1);

  const [isAvailable, setIsAvailable] = useState(false); // Controls button text and booking flow

  // Function to check room availability with the backend
  const checkAvailability = async () => {
    try {
      // Client-side validation for dates
      if (!checkInDate || !checkOutDate) {
        toast.error('Please select both check-in and check-out dates.');
        setIsAvailable(false); // Ensure availability is false if dates are missing
        return;
      }

      const inDate = new Date(checkInDate);
      const outDate = new Date(checkOutDate);

      // Check-out date must be strictly after check-in date
      if (inDate >= outDate) {
        toast.error('Check-out date must be after check-in date.');
        setIsAvailable(false); // Ensure availability is false on invalid dates
        return;
      }

      // API call to check availability
      const { data } = await axios.post('/api/bookings/check-availability', {
        room: id,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate
      });

      if (data.success) {
        // Update the isAvailable state based on the backend's response
        setIsAvailable(data.isAvailable); 
        if (data.isAvailable) {
          toast.success(data.message || 'Room is available for the selected dates!');
        } else {
          toast.error(data.message || 'Room is not available for the selected dates.');
        }
      } else {
        toast.error(data.message || 'Failed to check availability.');
        setIsAvailable(false); // Assume not available if backend reports failure
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      toast.error(error.response?.data?.message || error.message || 'An error occurred while checking availability.');
      setIsAvailable(false); // Assume not available on any error
    }
  };

  // OnSubmitHandler for the booking form
  const OnSubmitHandler = async (e) => {
    e.preventDefault(); // Prevent default form submission to handle it with React

    try {
      if (!isAvailable) {
        // If the room is not yet confirmed available, run the availability check
        // This will update 'isAvailable' state, and the button text will change on next render
        await checkAvailability(); 
      } else {
        // If 'isAvailable' is true, proceed with the actual booking
        const bookingData = {
          room: id,
          checkInDate,
          checkOutDate,
          guests,
          paymentMethod: "Pay At Hotel"
        };
        console.log("Sending availability request with:", {
            room: id,
            checkInDate,
            checkOutDate
          });

        const config = {
          headers: {
            Authorization: `Bearer ${await getToken()}` 
          }
          
        };

        const { data } = await axios.post('/api/bookings/book', bookingData, config);

        if (data.success) {
          toast.success(data.message || 'Booking successful!');
          navigate('/my-bookings');
          window.scrollTo(0, 0);
        } else {
          toast.error(data.message || 'Booking failed.');
        }
      }
    } catch (error) {
      console.error('Error during booking:', error);
      toast.error(error.response?.data?.message || error.message || 'An error occurred during booking.');
    }
  };

  useEffect(() => {
    const foundRoom = rooms.find(r => r._id === id);
    if (foundRoom) {
      setRoom(foundRoom);
      if (foundRoom.images && foundRoom.images.length > 0) {
        setMainImage(foundRoom.images[0]);
      }
    }
  }, [rooms, id]);

  // Render a loading state if room data isn't available yet
  if (!room) {
    return <div className='py-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-32'>Loading room details...</div>;
  }

  return (
    <div className='py-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-32'>
      {/* Room Details Header */}
      <div className='flex flex-col md:flex-row items-start md:items-center gap-2'>
        <h1 className='text-3xl md:text-4xl font-playfair'>
          {room.hotel?.name} <span className='font-inter text-sm'>({room.roomType})</span>
        </h1>
        <p className='text-xs font-inter py-1.5 px-3 text-white bg-orange-500 rounded-full'>20% OFF</p>
      </div>

      {/* Room Rating Display */}
      <div className='flex items-center gap-1 mt-2'>
        <StarRating />
        <p className='ml-2'>200+ reviews</p>
      </div>

      {/* Room Address */}
      <div className='flex items-center gap-1 text-gray-500 mt-2'>
        <img src={assets.locationIcon} alt="location-icon" />
        <span>{room.hotel?.address}</span>
      </div>

      {/* Room Images Gallery */}
      <div className='flex flex-col lg:flex-row mt-6 gap-6'>
        <div className='lg:w-1/2 w-full'>
          {mainImage && <img src={mainImage} alt="Room Main" className='w-full rounded-xl shadow-lg object-cover'/>}
        </div>
        <div className='grid grid-cols-2 gap-4 lg:w-1/2 w-full'>
          {room.images && room.images.length > 1 && room.images.map((image, index) => (
            <img
              onClick={() => setMainImage(image)}
              key={index}
              src={image}
              alt={`Room Thumbnail ${index + 1}`}
              className={`w-full rounded-xl shadow-md object-cover cursor-pointer ${mainImage === image ? 'outline outline-3 outline-orange-500' : ''}`}
            />
          ))}
        </div>
      </div>

      {/* Room Highlights and Price */}
      <div className='flex flex-col md:flex-row md:justify-between mt-10'>
        <div className='flex flex-col'>
          <h1 className='text-3xl md:text-4xl font-playfair'>Experience Luxury Like Never Before</h1>
          <div className='flex flex-wrap items-center mt-3 mb-6 gap-4'>
            {room.amenities.map((item, index) => (
              <div key={index} className='flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100'>
                <img src={facilityIcons[item]} alt={item} className='w-5 h-5'/>
                <p className='text-xs'>{item}</p>
              </div>
            ))}
          </div>
        </div>
        <p className='text-2xl font-medium'>${room.pricePerNight}/night</p>
      </div>

      {/* Check-In/Check-Out/Guests Booking Form */}
      <form
        onSubmit={OnSubmitHandler}
        className='flex flex-col md:flex-row items-start md:items-center justify-between bg-white shadow-[0px_0px_20px_rgba(0,0,0,0.15)] p-6 rounded-xl mx-auto mt-16 max-w-6xl'
      >
        <div className='flex flex-col flex-wrap md:flex-row items-start md:items-center gap-4 md:gap-10 text-gray-500'>
          {/* Check-In Date Input */}
          <div className='flex flex-col'>
            <label htmlFor="checkInDate" className='font-medium'>Check-In</label>
            <input
              type="date"
              id="checkInDate"
              className='w-full rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none'
              value={checkInDate}
              onChange={(e) => {
                setCheckInDate(e.target.value);
                setIsAvailable(false); // Reset availability when date changes
              }}
              min={new Date().toISOString().split('T')[0]} 
              required
            />
          </div>
          <div className='w-px h-15 bg-gray-300/70 max-md:hidden'></div>

          {/* Check-Out Date Input */}
          <div className='flex flex-col'>
            <label htmlFor="checkOutDate" className='font-medium'>Check-Out</label>
            <input
              type="date"
              id="checkOutDate"
              className='w-full rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none'
              value={checkOutDate}
              onChange={(e) => {
                setCheckOutDate(e.target.value);
                setIsAvailable(false); // Reset availability when date changes
              }}
              min={checkInDate || new Date().toISOString().split('T')[0]} 
              disabled={!checkInDate}
              required
            />
          </div>
          <div className='w-px h-15 bg-gray-300/70 max-md:hidden'></div>

          {/* Guests Input */}
          <div className='flex flex-col'>
            <label htmlFor="guests" className='font-medium'>Guests</label>
            <input
              type="number"
              id="guests"
              placeholder='0'
              min="1"
              className='w-20 rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none'
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
              required
            />
          </div>
        </div>

        {/* Booking Button - text changes based on availability status */}
        <button
          type='submit' // This button will trigger the OnSubmitHandler
          className='bg-primary hover:bg-primary-dull active:scale-95 transition-all text-white rounded-md max-md:w-full max-md:mt-6 md:px-25 md:py-4 text-base cursor-pointer'
        >
          {isAvailable ? "Book Now" : "Check Availability"} {/* Dynamic button text */}
        </button>
      </form>
      
      {/* Common Specifications Section */}
      <div className='mt-25 space-y-4'>
        {roomCommonData.map((spec, index) => (
          <div key={index} className='flex items-start gap-2'>
            <img src={spec.icon} alt={`${spec.title}-icon`} className='w-6.5'/>
            <div>
              <p className='text-base'>{spec.title}</p>
              <p className='text-gray-500'>{spec.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className='max-w-3xl border-y border-gray-300 my-15 py-10 text-gray-500'>
        <p>Guest will be allocated on the ground floor according to availability. You get a comfortable two bedroom apartment has 
          a true city feeling. The price quoted is for two guest, at the guest slot please mark the number of guests to get exact
          price for groups.</p>
      </div>

      {/* Hosted By Section */}
      <div className='flex flex-col items-start gap-4'>
        <div className='flex gap-4'>
          <img src="../src/assets/owner.png" alt="Host Avatar" className='h-14 w-14 md:h-18 md:w-18 rounded-full' />
          <div>
            <p className='text-lg md:text-xl'>Hosted by {room.hotel?.name}</p>
            <div className='flex items-center mt-1'>
              <StarRating />
              <p className='ml-2'>200+ reviews</p>
            </div>
          </div>
        </div>
        <button className='px-6 py-2 mt-4 rounded text-white bg-primary hover:bg-primary-dull transition-all cursor-pointer'>
          Contact Now
        </button>
      </div>
    </div>
  );
}

export default RoomDetails;