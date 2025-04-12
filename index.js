// Import required modules
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require("axios");
require('dotenv').config();

// Configuration
const API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
const allowedContacts = [
    // Add your allowed numbers here
];

// Initialize WhatsApp client
const client = new Client({
    authStrategy: new LocalAuth(),
});

// Event: QR code received
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log('Scan the QR code above to log in.');
});

// Event: Client is ready
client.on('ready', () => {
    console.log('✅ WhatsApp bot is ready!');
});

// Event: New message received
client.on('message', async msg => {
    const contact = await msg.getContact();
    const contactNumber = contact.number;

    // Process only if contact is allowed
    if (allowedContacts.includes(contactNumber)) {
        console.log('📩 Message received from:', contactNumber);

        // Gemini prompt with personality instructions
        const data = {
            contents: [{
                parts: [{
                    text: `Tu ek desi smart AI hai jo insaan jaise baat karta hai — bina kisi AI wale feel ke. Har reply bilkul natural, simple aur mast human style mein hona chahiye. Thoda Hindi-English mix chal sakta hai jaise normal log baat karte hain. Reply mein koi emojis nahi hone chahiye. Baat karne ka andaaz halka casual ho, jaise dost se baat kar rahe ho. Aur haan — reply hamesha short aur seedha point pe hona chahiye, jaise chhoti chat mein hota hai. Ab iss message ka ek chhota, casual aur natural reply de: ${msg.body}`
                }]
            }]
        };

        // Send request to Gemini API
        try {
            const response = await axios.post(GEMINI_API_URL, data, {
                headers: { 'Content-Type': 'application/json' }
            });

            const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (reply) {
                console.log('🤖 Gemini reply:', reply);
                msg.reply(reply);
            } else {
                console.warn('⚠️ No valid response from Gemini.');
                msg.reply("Sorry, I couldn't generate a response.");
            }
        } catch (error) {
            console.error('❌ Gemini API error:', error.message);
            msg.reply("Oops! Something went wrong with the AI.");
        }
    }
});

// Start the client
client.initialize();
