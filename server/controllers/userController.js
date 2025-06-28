// get /api/user
// getUserData  This function is designed to retrieve a user's role and their list of recently searched cities.
export const getUserData = async (req, res)=>{
    try {
        const role = req.user.role;
        const recentSearchCities = req.user.recentSearchCities;
        res.json({success: true, role, recentSearchCities})
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

// Store User Recent Searched Cities

export const storeRecentSearchedCities = async (req, res)=>{
    try {
        const {recentSearchCity} = req.body;  
        const user = await req.user;

        if(user.recentSearchCities.length < 3){
            user.recentSearchCities.push(recentSearchCity);
        }else{
            user.recentSearchCities.shift();
            user.recentSearchCities.push(recentSearchCity);
        }
        await user.save();
        res.json({success: true, message: "City added"});

    } catch (error) {
        res.json({success: false, message: error.message});
    }
};

/* 
storeRecentSearchedCities:
Purpose: This function handles storing a new city in the user's list of recent searches.

Flow:

    It extracts recentSearchCity from req.body, meaning this function expects the city to be sent in the request body.
    It retrieves the user object from req.user (again, populated by middleware).
    Logic for recentSearchCities:
        If the user.recentSearchCities array has less than 3 elements, it directly pushes the new recentSearchCity to the array.
        If the array already has 3 or more elements, it shift()s (removes the first element) and then push()es the new recent searchCity. This effectively maintains a list of the 3 most recent cities.
    await user.save(): This line saves the updated user document (with the modified recentSearchCities array) back to the MongoDB database.
    If successful, it sends a JSON response indicating success.
    If an error occurs, it catches it and sends a JSON response with success: false and an error message. */