import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    _id: {type: String, required: true},
    username: {type: String, required: true},
    email: {type: String, required: true},
    image: {type: String, required: true},
    role: {type: String, enum: ["user", "hotelOwner"], default: "user"},
    recentSearchCities: [{type: String, required: true}]
},{timestamps: true});

const User = mongoose.model("User", userSchema);

export default User;

/* User.js

This file defines the Mongoose schema for the User model, which represents how user data is structured in the MongoDB database.

    Imports:
        mongoose: The ODM (Object Data Modeling) library for MongoDB.
    userSchema:
        _id: A string type, required, likely storing a unique identifier for the user (e.g., from an external authentication provider).
        username: A string type, required.
        email: A string type, required.
        image: A string type, required (presumably for a profile picture URL).
        role: A string type with an enum constraint, meaning it can only be "user" or "hotelOwner". It defaults to "user".
        recentSearchCities: An array of strings, each required. This array will store the names of cities the user has recently searched for.
    {timestamps: true}: This option automatically adds createdAt and updatedAt fields to the schema, tracking when a user document was created and last updated.
    const User = mongoose.model("User", userSchema): This line compiles the schema into a Mongoose model, making it available to interact with the "users" collection in the MongoDB database.
    export default User: Exports the User model for use in other parts of the application.

*/