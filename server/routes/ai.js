const router = require('express').Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
console.log("------------------------ LOADED ROUTES/AI.JS ------------------------");

// Initialize Gemini
// NOTE: Make sure GEMINI_API_KEY is in .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper generic system prompt
const SYSTEM_PROMPT = `
You are the "Green Thread Assistant", an AI helper for a sustainable artisan marketplace called "Green Thread Connect".
Your goal is to help users (Buyers and Sellers) with:
1. Navigation
2. Product Discovery (Searching)
3. Account Creation (Sign Up) and Login

You must interact in a friendly, helpful manner.
CRITICAL: You must output your response in JSON format ONLY, so the frontend can parse it.
Structure:
{
  "message": "The text you want to say to the user (keep it concise, < 50 words usually).",
  "action": "OPTIONAL_ACTION_NAME", 
  "data": { ...optional data for the action... }
}

ACTIONS:
- "REGISTER_USER_INTENT": When user wants to sign up. Ask for Name, Email, Password, Role (Buyer/Seller), Region.
- "LOGIN_USER_INTENT": When user wants to login. Ask for Email, Password.
- "SEARCH_PRODUCTS": When user asks for products. Data should be { "query": "search term" }.
- "NAVIGATE": When user wants to go to a page. Data { "path": "/url" }.
- "NONE": General conversation.

Example Conversation:
User: "I want to buy bamboo chairs"
AI: { "message": "I can help you find bamboo chairs. Let me check our inventory.", "action": "SEARCH_PRODUCTS", "data": { "query": "bamboo chairs" } }

User: "Hi"
AI: { "message": "classified Hello! Welcome to Green Thread Connect. Are you looking to buy or sell today?", "action": "NONE" }
`;

// Helper function to try multiple models for Chat
async function generateChatResponse(message, history) {
    const models = ["gemini-3-flash-preview", "gemini-2.0-flash-001", "gemini-1.5-flash", "gemini-pro"];
    let lastError = null;

    for (const modelName of models) {
        try {
            console.log(`Trying model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const chat = model.startChat({
                history: [
                    {
                        role: "user",
                        parts: [{ text: SYSTEM_PROMPT }],
                    },
                    {
                        role: "model",
                        parts: [{ text: "Okay, I understand. I will output strictly in JSON format with message, action, and data fields." }],
                    },
                    ...(history || []).map(h => ({
                        role: h.sender === 'bot' ? 'model' : 'user',
                        parts: [{ text: h.text }]
                    }))
                ],
                generationConfig: {
                    responseMimeType: "application/json",
                }
            });

            const result = await chat.sendMessage(message);
            const response = await result.response;
            return response.text();
        } catch (err) {
            console.warn(`Model ${modelName} failed:`, err.message);
            lastError = err;
            // Continue to next model
        }
    }
    throw lastError || new Error("All models failed");
}

router.post('/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        
        console.log(`[${new Date().toISOString()}] Request received. Message: ${message}`);
        
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("API Key is missing in environment variables");
        }

        const text = await generateChatResponse(message, history);

        console.log("Gemini Response:", text);

        let parsedResponse;
        try {
            parsedResponse = JSON.parse(text);
        } catch (e) {
            console.error("JSON Parse Error, using fallback");
            parsedResponse = {
                message: text,
                action: "NONE"
            };
        }

        res.status(200).json(parsedResponse);

    } catch (err) {
        console.error("AI Error:", err);
        res.status(500).json({ 
            message: "Sorry, I'm having trouble connecting to my brain right now.",
            action: "NONE"
        });
    }
});

// Helper function for Image Analysis
async function analyzeImageWithFallback(prompt, base64Data) {
    const models = ["gemini-3-flash-preview", "gemini-2.0-flash-001", "gemini-1.5-flash", "gemini-1.5-pro"];
    let lastError = null;

    for (const modelName of models) {
        try {
            console.log(`Trying image model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            
            const result = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        data: base64Data,
                        mimeType: "image/jpeg" 
                    }
                }
            ]);

            const response = await result.response;
            return response.text();
        } catch (err) {
            console.warn(`Model ${modelName} failed:`, err.message);
            lastError = err;
        }
    }
    throw lastError || new Error("All image models failed");
}

// Helper function for Text Analysis
async function generateTextWithFallback(prompt) {
    const models = ["gemini-3-flash-preview", "gemini-2.0-flash-001", "gemini-1.5-flash", "gemini-1.5-pro"];
    let lastError = null;

    for (const modelName of models) {
        try {
            console.log(`Trying text model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (err) {
            console.warn(`Model ${modelName} failed:`, err.message);
            lastError = err;
        }
    }
    throw lastError || new Error("All text models failed");
}

// Endpoint for Image Analysis (Seller Add Product)
router.post('/analyze-image', authenticateToken, authorizeRoles('seller'), async (req, res) => {
    console.log(`[${new Date().toISOString()}] Analyze Image Request Received`);
    try {
        const { image } = req.body; 
        if (!image) {
            return res.status(400).json({ error: "No image provided" });
        }

        const { currency } = req.body;
        const targetCurrency = currency || 'USD';

        const prompt = `
        Analyze this product image for an artisan marketplace. 
        Identify what the item is (Name), what material it looks like, where it might be from (Region - make a best guess based on style), and suggest a fair price in ${targetCurrency}.
        Also provide a catchy description.
        
        Output JSON ONLY:
        {
            "name": "Product Name",
            "material": "Material",
            "region": "Region",
            "price": 50.00,
            "description": "Short description..."
        }
        `;

        const base64Data = image.split(',')[1] || image;
        
        const text = await analyzeImageWithFallback(prompt, base64Data);
        console.log("Gemini Response Recieved");
        
        let jsonResponse;
        try {
            const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            jsonResponse = JSON.parse(cleanedText);
        } catch (e) {
            console.error("Failed to parse JSON:", text);
            return res.status(500).json({ error: "Failed to parse AI response" });
        }

        res.json(jsonResponse);

    } catch (error) {
        console.error("Analyze Image Error:", error);
        res.status(500).json({ error: "Failed to analyze image" });
    }
});

// Endpoint for Eco-Friendly Material Suggestions
router.post('/suggest-eco-materials', authenticateToken, authorizeRoles('seller'), async (req, res) => {
    try {
        const { productName, currentMaterial, carbonFootprint } = req.body;
        
        const prompt = `
        The user is creating a product named "${productName}" using "${currentMaterial}". 
        The estimated carbon footprint for making this product is ${carbonFootprint} kg CO2e.
        Suggest 3 specific eco-friendly, sustainable alternative materials they could use to lower the carbon footprint.
        
        Output JSON ONLY exactly like this format:
        {
            "suggestions": [
                {
                    "material": "Name",
                    "reason": "Why it's better"
                }
            ]
        }
        `;

        const text = await generateTextWithFallback(prompt);
        let jsonResponse;
        try {
            const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            jsonResponse = JSON.parse(cleanedText);
        } catch (e) {
            console.error("Failed to parse JSON:", text);
            return res.status(500).json({ error: "Failed to parse AI response" });
        }

        res.json(jsonResponse);
    } catch (error) {
        console.error("Suggest Materials Error:", error);
        res.status(500).json({ error: "Failed to suggest eco-friendly materials" });
    }
});

// Endpoint for Price Prediction via Text Input
router.post('/predict-price', authenticateToken, authorizeRoles('seller'), async (req, res) => {
    try {
        const { product_name, material, category, region, size_cm, weight_g, description_keywords } = req.body;
        
        let prompt = `
        You are an expert artisan market appraiser.
        Predict a fair and competitive price in INR (Indian Rupees) for the following handmade/artisan product:
        - Product Name: ${product_name || 'Unknown'}
        - Material: ${material || 'Unknown'}
        - Category: ${category || 'Unknown'}
        - Region/Origin: ${region || 'Unknown'}
        - Size (cm): ${size_cm || 'Unknown'}
        - Weight (g): ${weight_g || 'Unknown'}
        - Features/Keywords: ${description_keywords || 'None'}
        
        Analyze the factors and return a JSON strictly containing a "predicted_price" as a number.
        Output JSON ONLY exactly like this format:
        {
            "predicted_price": 1250
        }
        `;

        const text = await generateTextWithFallback(prompt);
        let jsonResponse;
        try {
            const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            jsonResponse = JSON.parse(cleanedText);
            
            // Ensure predicted_price is a number
            if (!jsonResponse.predicted_price || isNaN(jsonResponse.predicted_price)) {
                 throw new Error("Invalid price returned from model");
            }
        } catch (e) {
            console.error("Failed to parse JSON for price:", text);
            // Default fallback if parsing fails
            jsonResponse = { predicted_price: 500 }; 
        }

        res.json(jsonResponse);
    } catch (error) {
        console.error("Predict Price Error:", error);
        res.status(500).json({ error: "Failed to predict price" });
    }
});

module.exports = router;
