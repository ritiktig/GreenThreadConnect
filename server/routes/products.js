const router = require('express').Router();
const Product = require('../models/Product');
const User = require('../models/User');

// Get All Products
router.get('/', async (req, res) => {
    try {
        // Populate seller to get name
        const products = await Product.find().populate('seller', 'name email region');
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Add Product
router.post('/', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Get User's Products (for Seller Dashboard)
router.get('/seller/:sellerId', async (req, res) => {
    try {
        const products = await Product.find({ seller: req.params.sellerId });
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Update Product
router.patch('/:id', async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id, 
            { $set: req.body }, 
            { new: true }
        );
        res.status(200).json(updatedProduct);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Delete Product
router.delete('/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Product has been deleted...' });
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
