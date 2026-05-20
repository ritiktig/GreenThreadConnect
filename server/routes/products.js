const router = require('express').Router();
const Product = require('../models/Product');
const User = require('../models/User');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
var ImageKit = require("imagekit");

var imagekit = new ImageKit({
    publicKey : process.env.IMAGEKIT_PUBLIC_KEY || "YOUR_IMAGEKIT_PUBLIC_KEY",
    privateKey : process.env.IMAGEKIT_PRIVATE_KEY || "YOUR_IMAGEKIT_PRIVATE_KEY",
    urlEndpoint : process.env.IMAGEKIT_URL_ENDPOINT || "YOUR_IMAGEKIT_URL_ENDPOINT"
});

// Get All Products (Public)
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
        console.error("Fetch products error:", err);
        res.status(500).json({ message: "Failed to load products" });
    }
});

// Add Product (Authenticated Sellers Only)
router.post('/', authenticateToken, authorizeRoles('seller'), async (req, res) => {
    try {
        let productData = { ...req.body };
        
        // Auto-assign authenticated user as the product seller to prevent spoofing
        productData.seller = req.user.id;
        
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
            }
        }

        const newProduct = new Product(productData);
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        console.error("Product Creation Error:", err);
        res.status(500).json({ message: "Failed to create product" });
    }
});

// Get User's Products (Authenticated Sellers Only - must match own ID)
router.get('/seller/:sellerId', authenticateToken, authorizeRoles('seller'), async (req, res) => {
    try {
        if (req.params.sellerId !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized access: seller ID mismatch" });
        }
        const products = await Product.find({ seller: req.user.id });
        res.status(200).json(products);
    } catch (err) {
        console.error("Fetch seller products error:", err);
        res.status(500).json({ message: "Failed to load seller products" });
    }
});

// Get Single Product (Public)
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('seller', 'name email region');
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json(product);
    } catch (err) {
        console.error("Error fetching single product:", err);
        res.status(500).json({ message: "Failed to retrieve product details" });
    }
});

// Update Product (Authenticated Seller Owner Only)
router.patch('/:id', authenticateToken, authorizeRoles('seller'), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Verify product ownership
        if (product.seller.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized access: You do not own this product" });
        }

        // Prevent modification of seller field in payload
        const updateData = { ...req.body };
        delete updateData.seller;

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id, 
            { $set: updateData }, 
            { new: true }
        );
        res.status(200).json(updatedProduct);
    } catch (err) {
        console.error("Update product error:", err);
        res.status(500).json({ message: "Failed to update product" });
    }
});

// Delete Product (Authenticated Seller Owner Only)
router.delete('/:id', authenticateToken, authorizeRoles('seller'), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Verify product ownership
        if (product.seller.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized access: You do not own this product" });
        }

        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Product has been deleted...' });
    } catch (err) {
        console.error("Delete product error:", err);
        res.status(500).json({ message: "Failed to delete product" });
    }
});

module.exports = router;

