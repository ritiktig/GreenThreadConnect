const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    material: { type: String },
    dimensions: { type: String },
    region: { type: String },
    category: { type: String },
    price: { type: Number, required: true },
    stock: { type: Number, default: 1 },
    sustainabilityRating: { type: Number, min: 1, max: 5 },
    imageUrl: { type: String }, // Base64 or URL
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    carbonFootprint: { type: Number },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
