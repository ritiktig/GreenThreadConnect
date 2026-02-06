const router = require('express').Router();

router.post('/', (req, res) => {
    // Mock Price Prediction Logic
    try {
        const { region, material, weight_g } = req.body;
        
        // Simple mock algorithm
        let basePrice = 50;
        if (material && material.toLowerCase().includes('silk')) basePrice += 30;
        if (region && region.toLowerCase().includes('us')) basePrice += 20;
        if (weight_g) basePrice += (weight_g * 0.01);

        // Add some random variance
        const predictedPrice = (basePrice + Math.random() * 20).toFixed(2);
        
        // Return result
        // Simulate delay
        setTimeout(() => {
            res.status(200).json({ predicted_price: predictedPrice });
        }, 1000);

    } catch (err) {
        res.status(500).json({ message: "Prediction failed" });
    }
});

module.exports = router;
