const axios = require('axios');

async function testCarbon() {
    try {
        const payload = {
            material_quantity_kg: 10,
            energy_used_kwh: 5,
            transport_distance_km: 100,
            product_weight_kg: 2,
            recycled_material_percent: 50,
            primary_material: "wood",
            production_type: "handmade"
        };

        const response = await axios.post('http://localhost:5000/api/predict/carbon', payload);
        console.log("Success:", response.data);
    } catch (error) {
        if (error.response) {
             console.log("Response Error:", error.response.data);
        } else {
             console.log("Error:", error.message);
        }
    }
}

testCarbon();
