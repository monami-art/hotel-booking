import { request } from 'express';
import stripe from 'stripe';
import Booking from '../models/Booking.js';

// APi to handle Stripe Webhooks
export const stripeWebhooks = async (request, response) => {
// StripeGateway Initialize
const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
const sig = request.headers['stripe-signature'];
let event;;
try {
    event = stripeInstance.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
} catch (error) {
    response.status(400).send('webhook Error: ${err.message}');
}

// Handle the event
    if(event.type === "payment_intent.succeeded"){
        const payment_intent = event.data.object;
        const payment_intentId = payment_intent.id;

        // Getting Session Metadata
        const  session = await stripeInstance.checkout.sessions.list({
            payment_intent : payment_intentId,
        });

        const { bookingId }= session.data[0].metadata;

        // Mark Payment as paid
        await Booking.findByIdAndUpdate(bookingId, {isPaid: true, paymentMethod: "Stripe"});
    }else{
        console.log("Unhandled event type :", event.type);
    }
    response.json({received: true});
}