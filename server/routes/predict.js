const router = require('express').Router();
const axios = require('axios');

const ML_URL = process.env.ML_BACKEND_URL || 'http://localhost:5001';

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

    // Validate inputs (Allow 0 as a valid number)
    const requiredFields = [material_quantity_kg, energy_used_kwh, transport_distance_km, product_weight_kg, recycled_material_percent, primary_material, production_type];
    
    if (requiredFields.some(field => field === undefined || field === null || field === '' || Number.isNaN(field))) {
        return res.status(400).json({ error: "Missing required fields for carbon prediction" });
    }

    try {
        // Attempt to call the actual ML model running on Python
        try {
            const mlResponse = await axios.post(`${ML_URL}/predict-carbon`, req.body);
            if (mlResponse.data && mlResponse.data.carbon_emission !== undefined) {
                console.log(`✅ [Carbon Predict] Successfully used Python ML Model! Prediction: ${mlResponse.data.carbon_emission}`);
                return res.json({
                    carbon_emission: mlResponse.data.carbon_emission,
                    source: "ml_model"
                });
            }
        } catch (mlError) {
            console.warn("ML Model request failed. Falling back to simple JS math logic:", mlError.message);
        }

        // Fallback Javascript Logic
        const mat_qty = parseFloat(material_quantity_kg) || 0;
        const energy = parseFloat(energy_used_kwh) || 0;
        
        let prediction_value = (mat_qty * 2.5) + (energy * 0.4);
        
        console.log(`⚠️ [Carbon Predict] Using JS Math Fallback Formula! Prediction: ${prediction_value}`);
        res.json({
            carbon_emission: prediction_value, 
            source: "javascript_fallback"
        });

    } catch (error) {
        console.error("Carbon Calculation Error:", error);
        res.status(500).json({ error: "Prediction failed" });
    }
});

module.exports = router;
