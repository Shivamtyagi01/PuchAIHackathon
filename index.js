// index.js

require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse incoming JSON
app.use(express.json());

// Your secret bearer token and phone number from the .env file
const VALID_TOKEN = process.env.AUTH_TOKEN;
const MY_PHONE_NUMBER = process.env.MY_NUMBER;

// --- The MCP Validate Tool ---
// This is the endpoint Puch AI will call to authenticate your server.
app.post('/mpc/validate', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log(`Validation request received. Token: ${token}`);

    if (!token || token !== VALID_TOKEN) {
        return res.status(403).send({ error: "Forbidden: Invalid bearer token." });
    }

    // Return the user's phone number as a JSON object
    return res.status(200).json({ phone_number: MY_PHONE_NUMBER });
});

// --- Your Main Webhook ---
// This is where Puch AI will forward messages from WhatsApp
app.post('/webhook', async (req, res) => {
    // Acknowledge the request immediately
    res.sendStatus(200);

    const messageData = req.body;
    const sender = messageData.from;

    if (messageData.text) {
        const userMessage = messageData.text.body;
        console.log(`Text message from ${sender}: ${userMessage}`);

        // Simple placeholder response
        const responseText = "Hello! Your message has been received and the connection is working correctly.";

        // Send the response back
        await sendPuchAIResponse(sender, responseText);
    }
});

// Helper function to send a message back to Puch AI
const sendPuchAIResponse = async (to, text) => {
    const puchAiApiUrl = 'https://api.puch.ai/v1/messages';
    
    try {
        await axios.post(puchAiApiUrl, {
            to: to,
            text: text
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${VALID_TOKEN}`
            }
        });
        console.log('Message sent successfully.');
    } catch (error) {
        console.error('Error sending message:', error.response ? error.response.data : error.message);
    }
};

app.get("/" , (req , res) => {
    res.send("Now orking");
})
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});