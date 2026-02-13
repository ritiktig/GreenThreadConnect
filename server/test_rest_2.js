require('dotenv').config();

async function testRest() {
    const apiKey = process.env.GEMINI_API_KEY;
    // Try gemini-2.0-flash-001
    const modelObj = "gemini-2.0-flash-001"; 
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelObj}:generateContent?key=${apiKey}`;

    console.log(`Testing REST API: ${modelObj}`);

    const body = {
        contents: [{
            parts: [{ text: "Hello" }]
        }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log("REST API Success:", JSON.stringify(data, null, 2));
        } else {
            console.error("REST API Failed:", response.status, response.statusText);
            console.error("Error Details:", JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error("Network Error:", error);
    }
}

testRest();
