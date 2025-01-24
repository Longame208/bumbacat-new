// Install required packages: express, axios, dotenv
// Run: npm install express axios dotenv

// Import required modules
const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Route to handle ChatGPT API calls
app.post('/chatgpt', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                },
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error('Error calling ChatGPT API:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to call ChatGPT API' });
    }
});

// Root route
app.get('/', (req, res) => {
    res.send('ChatGPT API Server is running!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
