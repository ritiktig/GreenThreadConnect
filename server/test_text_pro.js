require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testPro() {
    console.log("Key Loaded:", !!process.env.GEMINI_API_KEY);
    console.log("Key Prefix:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 5) : "NONE");
    
    if (!process.env.GEMINI_API_KEY) return;
    
    console.log("Testing Gemini Pro (Text Only)...");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    try {
        const result = await model.generateContent("Hello!");
        console.log("Success:", result.response.text());
    } catch (e) {
        console.error("Failed:", e.message);
    }
}

testPro();
