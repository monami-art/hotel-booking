import User from  "../models/User.js";

// Middleware to check if user is authenticated
export const protect = async (req, res, next)=>{
    const {userId} = req.auth;
    if(!userId){
        res.json({success: false, message: "not authenticated"});
    }else{
       const user = await User.findById(userId); // Use the imported User model
        req.user = user;
        next();
    }
}

/* authMiddleware.js

This file contains middleware responsible for user authentication.

    Imports:
        User from ../models/User: The Mongoose User model.
    protect:
        Purpose: This middleware ensures that only authenticated users can access the subsequent route handlers.
        Flow:
            It attempts to get userId from req.auth. This implies that req.auth (and userId within it) is set by some previous authentication mechanism (e.g., a JWT verification middleware that decodes a token and attaches user information to req.auth).
            if(!userId): If userId is not found, it means the user is not authenticated, and it sends a JSON response with success: false and a "not authenticated" message.
            else (if userId exists):
                const user = await user.findById(userId): It queries the database to find the user document corresponding to the userId.
                req.user = user: This is a crucial step. It attaches the retrieved user document to the req object. This makes the user's data (like role and recentSearchCities) available to subsequent middleware and route handlers (e.g., in userController.js).
                next(): This calls the next middleware or route handler in the chain.

*/