const router = require('express').Router();

// Carbon Emission Prediction
router.post('/carbon', async (req, res) => {
    const { 
        material_quantity_kg, 
        energy_used_kwh, 
        transport_distance_km, 
        product_weight_kg, 
        recycled_material_percent, 
        primary_material, 
        production_type 
    } = req.body;

    // Validate inputs
    if (!material_quantity_kg || !energy_used_kwh || !transport_distance_km || !product_weight_kg || !recycled_material_percent || !primary_material || !production_type) {
        return res.status(400).json({ error: "Missing required fields for carbon prediction" });
    }

    try {
        // In Vercel, the Python function is at /api/carbon.py which we mapped to /api/predict/carbon in vercel.json
        // However, since we are inside the Express app, we can't easily "fetch" our own Vercel API without the full domain.
        // A better approach for Vercel is to have the frontend call the Python API directly if possible, OR
        // make an HTTP request to the relative path if the environment supports it (it usually doesn't without a domain).
        
        // TEMPORARY FIX:
        // For now, we will try to fetch from the deployment URL if available, or localhost.
        
        const protocol = req.protocol;
        const host = req.get('host');
        const apiUrl = `${protocol}://${host}/api/predict/carbon`; // This routes to the Python handler via vercel.json

        console.log("Delegating prediction to Python Runtime at:", apiUrl);

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Python API Error: ${errText}`);
        }

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error("Carbon Model Delegation Error:", error);
        // Fallback to Gemini if Python fails (e.g. running locally without python server)
        console.log("Falling back to Gemini...");
        try {
            const { GoogleGenerativeAI } = require("@google/generative-ai");
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            
            const prompt = `Estimate carbon footprint (kg CO2e) for: ${primary_material}, ${material_quantity_kg}kg, ${energy_used_kwh}kWh. Return JSON { "carbon_emission": NUMBER }`;
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            const json = JSON.parse(text.replace(/```json|```/g, '').trim());
            res.json(json);
        } catch (geminiErr) {
            res.status(500).json({ error: "Prediction failed (Both Methodologies)" });
        }
    }
});

module.exports = router;
