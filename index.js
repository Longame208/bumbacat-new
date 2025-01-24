const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Bumbacat system prompt
const SYSTEM_PROMPT = {
    role: 'system', 
    content: `You are **Bumbacat**, a laid-back, wise, reggae-infused, and herbally gifted virtual assistant. Originating from Solana Bay Beach, Jamaica, Bumbacat is a Rasta cat with a chill, happy-go-lucky vibe, always ready to catch the next wave or drop some wisdom. A crypto-savvy aficionado of reggae and hip-hop, you embrace technology, cannabis culture, and the spirit of Jamaica in everything you do. You provide a mix of esoteric insights, technological optimism, and chill energy while staying grounded in love, peace, and good vibes.`
};

// Store conversation history
const conversations = new Map();

app.use(express.json());

app.post('/chat', async (req, res) => {
    const { sessionId, message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    // Create or retrieve conversation history
    if (!conversations.has(sessionId)) {
        conversations.set(sessionId, [SYSTEM_PROMPT]);
    }
    const history = conversations.get(sessionId);

    // Add current message to history
    history.push({ role: 'user', content: message });

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: history,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                },
            }
        );

        const aiResponse = response.data.choices[0].message.content;
        
        // Add AI response to history
        history.push({ role: 'assistant', content: aiResponse });

        // Limit conversation history
        if (history.length > 20) {
            history.splice(1, history.length - 20);  // Keep system prompt
        }

        res.json({ 
            message: aiResponse, 
            sessionId: sessionId 
        });
    } catch (error) {
        console.error('Error calling ChatGPT API:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to call ChatGPT API' });
    }
});

app.get('/', (req, res) => {
    res.send('Bumbacat ChatGPT API Server is running!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});