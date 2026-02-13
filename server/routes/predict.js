const router = require('express').Router();

// Carbon Emission Prediction
router.post('/carbon', (req, res) => {
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

    const { spawn } = require('child_process');
    const path = require('path');

    const scriptPath = path.join(__dirname, '../../ml/predict_carbon.py');
    const pythonProcess = spawn('python', [scriptPath]);

    let dataString = '';
    let errorString = '';

    // Send data to python script via stdin
    const inputData = JSON.stringify(req.body);
    pythonProcess.stdin.write(inputData);
    pythonProcess.stdin.end();

    pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        errorString += data.toString();
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            console.error(`Python script exited with code ${code}`);
            console.error(`Error: ${errorString}`);
            return res.status(500).json({ error: "Prediction failed", details: errorString });
        }
        
        try {
            const result = JSON.parse(dataString);
            if (result.error) {
                return res.status(400).json(result);
            }
            res.json(result);
        } catch (e) {
            console.error("Failed to parse Python output:", dataString);
            res.status(500).json({ error: "Invalid response from prediction model" });
        }
    });
});

module.exports = router;
