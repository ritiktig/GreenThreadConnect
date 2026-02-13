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
        // Implement the carbon calculation logic directly in JavaScript
        // This mirrors the logic in api/carbon.py to avoid recursive calls and Python dependency for basic calculation
        
        let prediction_value = 0;
        
        // Basic calculation based on the python model's fallback logic
        // prediction_value = (material_quantity_kg * 2.5) + (energy_used_kwh * 0.4)
        
        const mat_qty = parseFloat(material_quantity_kg) || 0;
        const energy = parseFloat(energy_used_kwh) || 0;
        
        prediction_value = (mat_qty * 2.5) + (energy * 0.4);
        
        // Add some small variance based on other factors to make it slightly more dynamic if needed, 
        // but for now strict adherence to the fallback logic is safest.
        
        // Send response
        res.json({
            carbon_emission: prediction_value, 
            source: "javascript_logic"
        });

    } catch (error) {
        console.error("Carbon Calculation Error:", error);
        res.status(500).json({ error: "Prediction failed" });
    }
});

module.exports = router;
