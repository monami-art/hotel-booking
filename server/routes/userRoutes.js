import express from "express";
import { protect } from "../middlewares/authMiddleware.js"
import { getUserData,storeRecentSearchedCities } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get('/', protect, getUserData);
userRouter.post('/', protect, storeRecentSearchedCities );

export default userRouter;


/* userRoutes.js

This file sets up the API endpoints for user-related operations.

    Imports:
        express: The web framework.
        protect from ../middlewares/authMiddleware.js: This is a custom middleware to ensure a user is authenticated before accessing certain routes.
        getUserData and storeRecentSearchedCities from ../controllers/userController.js: The functions defined in userController.js.
    userRouter: An instance of express.Router() is created to define routes.
    Route Definitions:
        userRouter.get('/', protect, getUserData):
            This defines a GET request to the root path (/) of this router.
            When this route is hit, the protect middleware runs first. If protect successfully authenticates the user, it calls next(), allowing getUserData to execute.
        userRouter.post('/', protect, storeRecentSearchedCities):
            This defines a POST request to the root path (/) of this router.
            Similar to the GET route, the protect middleware runs first, followed by storeRecentSearchedCities if authentication is successful.
    export default userRouter: This exports the configured router to be used in the main Express application.

 */
