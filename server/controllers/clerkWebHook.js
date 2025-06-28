import User from "../models/User.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res) => {
  try {
    // Get the raw body as a string for Svix verification
    const payload = req.body.toString(); // req.body is a Buffer now

    // Create a Svix instance with clerk webhook secret
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    // Getting Headers
    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    // Verifying Headers using the raw payload
    const svixEvent = await whook.verify(payload, headers);

    // Parse the event data after successful verification
    const { data, type } = svixEvent; // Svix returns the parsed event data

    /* Getting Data from request body
    const userData = {
      _id: data.id,
      email: data.email_addresses[0].email_address,
      username: data.first_name + " " + data.last_name,
      image: data.image_url,
    };
   */   
  
    // Handle cases where first_name or last_name might be null/undefined
    if (!data.first_name && !data.last_name) {
        userData.username = "New User"; // Or handle it as per your application's logic
    } else if (!data.first_name) {
        userData.username = data.last_name;
    } else if (!data.last_name) {
        userData.username = data.first_name;
    }


    // Switch Cases for different Events
    switch (type) {
      case "user.created":{
        console.log('User created webhook received:', userData);
        const userData = {
      _id: data.id,
      email: data.email_addresses[0].email_address,
      username: data.first_name + " " + data.last_name,
      image: data.image_url,
    };
        
        }
        await User.create(userData);
        break;
      case "user.updated":{
         console.log('User updated webhook received:', userData);
          const userData = {
      _id: data.id,
      email: data.email_addresses[0].email_address,
      username: data.first_name + " " + data.last_name,
      image: data.image_url,
    };
      }
       
        await User.findByIdAndUpdate(data.id, userData);
        break;
      case "user.deleted":
        console.log('User deleted webhook received:', data.id);
        await User.findByIdAndDelete(data.id);
        break;
      default:
        console.log('Unhandled webhook type:', type);
        break;
    }

    res.json({ success: true, message: "Webhook received" });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export default clerkWebhooks;