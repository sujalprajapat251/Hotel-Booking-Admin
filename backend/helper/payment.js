require("dotenv").config();

const express = require("express");
const app = express();
const { resolve } = require("path");

// Load Stripe Secret Key from .env
const STRIPE_SECRET_KEY = process.env.STRIP_SECRET;
const stripe = require("stripe")(STRIPE_SECRET_KEY);



app.use(express.static("."));
app.use(express.json());

const calculateOrderAmount = (items) => {
    if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error("Items array is missing or empty");
    }

    console.log("Original amount:", items[0].amount);
    return Math.round(items[0].amount * 100);
};



app.post("/create-payment-intent", async (req, res) => {
    const { items, currency } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
        amount: calculateOrderAmount(items),
        currency
    });

    res.send({
        clientSecret: paymentIntent.client_secret
    });
});

app.get('/greet', (req, res) => {
    res.send("It is working fine");
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Node server listening on port ${PORT}`));
