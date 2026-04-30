const router = require('express').Router();
const Product = require('../models/Product');
const User = require('../models/User');
var ImageKit = require("imagekit");

var imagekit = new ImageKit({
    publicKey : process.env.IMAGEKIT_PUBLIC_KEY || "YOUR_IMAGEKIT_PUBLIC_KEY",
    privateKey : process.env.IMAGEKIT_PRIVATE_KEY || "YOUR_IMAGEKIT_PRIVATE_KEY",
    urlEndpoint : process.env.IMAGEKIT_URL_ENDPOINT || "YOUR_IMAGEKIT_URL_ENDPOINT"
});

// Get All Products
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Populate seller to get name, add pagination
        const products = await Product.find()
            .skip(skip)
            .limit(limit)
            .populate('seller', 'name email region');
            
        const totalProducts = await Product.countDocuments();

        res.status(200).json({
            products,
            totalPages: Math.ceil(totalProducts / limit),
            currentPage: page
        });
    } catch (err) {
        res.status(500).json(err);
    }
});

// Add Product
router.post('/', async (req, res) => {
    try {
        let productData = { ...req.body };
        
        // If imageUrl exists and is a base64 string, upload to ImageKit
        if (productData.imageUrl && productData.imageUrl.startsWith('data:image')) {
            try {
                const uploadResponse = await imagekit.upload({
                    file: productData.imageUrl, // base64 string
                    fileName: `product_${Date.now()}.jpg`,
                    folder: "/GreenThreadConnect"
                });
                // Replace the heavy base64 string with the fast global URL
                if (uploadResponse && uploadResponse.url) {
                    productData.imageUrl = uploadResponse.url;
                }
            } catch (ikErr) {
                console.error("ImageKit Upload Error (Failing Gracefully to Base64):", ikErr);
                // We DO NOT return a 500 here anymore. We just let it continue 
                // so it saves the original base64 string to MongoDB instead!
            }
        }

        const newProduct = new Product(productData);
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        console.error("Product Creation Error:", err);
        res.status(500).json({ error: "Failed to create product", details: err });
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

// Get Single Product
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('seller', 'name email region');
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json(product);
    } catch (err) {
        console.error("Error fetching single product:", err);
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
