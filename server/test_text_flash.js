require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testText() {
    console.log("Testing Gemini 1.5 Flash (Text Only)...");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
        const result = await model.generateContent("Hello!");
        console.log("Success:", result.response.text());
    } catch (e) {
        console.error("Failed:", e.message);
    }
}

testText();
