require('dotenv').config();

async function testRestVision() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API KEY found!");
        return;
    }

    const modelObj = "gemini-1.5-flash"; // Common model name
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelObj}:generateContent?key=${apiKey}`;

    console.log(`Testing REST API: ${modelObj}`);

    // Small 1x1 JPEG
    const base64Image = "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/wAQAHwEAAwEBAQEBAQEBAQAAAAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9aADAMBAAIRAxEAPwD3+iiigD//2Q==";

    const body = {
        contents: [{
            parts: [
                { text: "What is this image?" },
                { inline_data: { mime_type: "image/jpeg", data: base64Image } }
            ]
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

testRestVision();
