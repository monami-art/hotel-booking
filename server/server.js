import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from '@clerk/express'
import clerkWebhooks from "./controllers/clerkWebHook.js";
import userRouter from "./routes/userRoutes.js";
import hotelRouter from "./routes/hotel.routes.js";
import connectCloudinary from "./configs/cloudinary.js";
import roomRouter from "./routes/roomRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import { stripeWebhooks } from "./controllers/stripeWebhooks.js";
import Booking from './models/Booking.js';

connectDB();
connectCloudinary();

const app = express();
app.use(cors());

// API to listen to Stripe Webhooks
app.post('/api/stripe', express.raw({type: "application/json"}), stripeWebhooks)

// --- Middleware for raw body parsing specifically for the webhook route ---
// This middleware should be placed before express.json() if you need both.
// For the webhook, we'll use a specific setup.
app.use("/api/clerk", express.raw({ type: "application/json" })); // This gets the raw body for Svix verification

// --- General JSON parsing middleware for other routes if needed ---
app.use(express.json()); // Keep this for other routes that expect JSON

app.use(clerkMiddleware());

// API to listen to Clerk Webhook
// clerkWebhooks will now receive req.body as a Buffer (the raw body)
app.use("/api/clerk", clerkWebhooks);
app.use("/api/user", userRouter);
app.use("/api/hotels", hotelRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/bookings", bookingRouter);

app.get('/', (req, res)=> res.send("API is working"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));