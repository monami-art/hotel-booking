import axios from 'axios';
import { useContext, useEffect, createContext, useState } from 'react'; // Group imports
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import { toast } from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const AppContext = createContext();


export const AppProvider = ({ children }) => {
    const currency = import.meta.env.VITE_CURRENCY || "$"; // Corrected env access
    const navigate = useNavigate();
    const { user } = useUser();
    const { getToken } = useAuth();

    const [isOwner, setIsOwner] = useState(false);
    const [showHotelReg, setShowHotelReg] = useState(false);
    const [searchedCities, setSearchedCities] = useState([]);
    const [isLoadingUser, setIsLoadingUser] = useState(true); // Added loading state
    const [rooms, setRooms] = useState([]); 
    const [selectedDestination, setSelectedDestination] = useState('');

    const fetchRooms = async () =>{
        try {
            const { data } = await axios.get('/api/rooms')
             if (data.rooms) {
                setRooms(data.rooms)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const fetchUser = async (retryCount = 0) => {
        const MAX_RETRIES = 3; // Define max retries
        setIsLoadingUser(true); // Set loading true at the start of fetch
        try {
            const { data } = await axios.get('/api/user', {
                headers: { Authorization: `Bearer ${await getToken()}` }
            });

            if (data.success) {
                setIsOwner(data.role === "hotelOwner");
                //setSearchedCities(data.recentSearchedCities);
                setSearchedCities(Array.isArray(data.recentSearchedCities) ? data.recentSearchedCities : []);
            } else {
                if (retryCount < MAX_RETRIES) {
                    setTimeout(() => { // Corrected setTimeout
                        fetchUser(retryCount + 1); // Pass retryCount
                    }, 5000);
                } else {
                    toast.error("Failed to fetch user data after multiple attempts.");
                    console.error("Max retries reached for fetching user data.");
                }
            }
        } catch (error) {
            console.error("Error fetching user data:", error); // Log full error
            toast.error(error.message);
        } finally {
            setIsLoadingUser(false); // Set loading false after fetch completes (success or error)
        }
    };

    useEffect(() => {
        if (user) {
            fetchUser();
        } else {
            // If user is null (e.g., not logged in), set loading to false
            // and ensure isOwner is false if that's the default state for non-logged-in users.
            setIsLoadingUser(false);
            setIsOwner(false);
            setSearchedCities([]); // Clear searched cities for non-logged-in users
        }
    }, [user]); // Dependency on user

    useEffect(()=>{
        fetchRooms()
    }, [])

    const value = {
        currency,
        navigate,
        user,
        getToken,
        isOwner,
        setIsOwner,
        axios, // Axios instance is available globally, consider if passing it via context is ideal
        showHotelReg,
        setShowHotelReg,
        searchedCities,
        setSearchedCities,
        isLoadingUser, // Expose loading state
        rooms,
        setRooms,
        selectedDestination,
        setSelectedDestination
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext); // Corrected useContext usage