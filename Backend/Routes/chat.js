const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// POST — AI chatbot se recommendations lo
router.post('/', async (req, res) => {
    const { deviceData } = req.body;
    
    try {
        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are an energy saving expert. 
                    Analyze the energy consumption data and give 
                    3 specific, practical tips to reduce electricity 
                    bill. Keep response concise and friendly.`
                },
                {
                    role: "user",
                    content: `My home energy usage today:
                    ${JSON.stringify(deviceData, null, 2)}
                    Rate: 50 PKR per kWh.
                    Please suggest ways to reduce my bill.`
                }
            ],
            model: "llama-3.3-70b-versatile",
            max_tokens: 500,
            temperature: 0.7
        });

        res.json({ 
            reply: response.choices[0].message.content 
        });

    } catch (err) {
        if (err.status === 401) {
            res.status(401).json({ error: 'Invalid Groq API key!' });
        } else if (err.status === 429) {
            res.status(429).json({ error: 'API limit reached, try later!' });
        } else {
            res.status(500).json({ error: 'AI service unavailable!' });
        }
    }
});

module.exports = router; 