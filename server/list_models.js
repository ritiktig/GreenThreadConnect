require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function list() {
    console.log("Fetching models...");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Note: getGenerativeModel doesn't list models. We need REST or separate client.
    // Using fetch for listing.
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    try {
        const resp = await fetch(url);
        const data = await resp.json();
        if (data.models) {
            const fs = require('fs');
            const list = data.models.map(m => m.name.replace('models/', '')).join('\n');
            fs.writeFileSync('models_list.txt', list);
            console.log("Written to models_list.txt");
        } else {
            console.log("No models found:", data);
        }
    } catch (e) {
        console.error("List failed:", e.message);
    }
}

list();
