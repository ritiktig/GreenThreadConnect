require('dotenv').config();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API KEY found!");
        return;
    }
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    console.log(`Fetching models from ${listUrl}...`);
    try {
        const listResp = await fetch(listUrl);
        const listData = await listResp.json();
        
        if (!listData.models) {
            console.error("No models found or error:", listData);
            return;
        }

        console.log("Available Models:");
        listData.models.forEach(m => console.log(m.name));
    } catch (error) {
        console.error("Error fetching models:", error);
    }
}

listModels();
