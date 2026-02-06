const router = require('express').Router();
const Order = require('../models/Order');

// Create Order
router.post('/', async (req, res) => {
    try {
        console.log('📦 Receiving Order Request:', req.body);
        const newOrder = new Order(req.body);
        const savedOrder = await newOrder.save();
        console.log('✅ Order Saved:', savedOrder._id);
        res.status(201).json(savedOrder);
    } catch (err) {
        console.error('❌ Order Save Failed:', err);
        res.status(500).json(err);
    }
});

// Get Buyer Orders
router.get('/buyer/:buyerId', async (req, res) => {
    try {
        console.log(`🔍 Fetching orders for buyer: ${req.params.buyerId}`);
        const orders = await Order.find({ buyer: req.params.buyerId })
                             .populate('items.product')
                             .sort({ createdAt: -1 });
        
        console.log(`✅ Found ${orders.length} orders for buyer ${req.params.buyerId}`);
        res.status(200).json(orders);
    } catch (err) {
        console.error('❌ Error fetching buyer orders:', err);
        res.status(500).json(err);
    }
});

// Get Seller Orders (Complex: Find orders that contain products by this seller)
router.get('/seller/:sellerId', async (req, res) => {
    try {
        // Find all orders where at least one item has a product with this seller
        // This requires "deep population" or checking product's seller via aggregation
        // For MERN simplicity, we might iterate or use aggregation.
        // Let's assume we fetch all orders and filter logic (not efficient but simple for now)
        // OR better: query Orders where items.product matches... wait, products details are in Product collection.
        // We'd need to first find products by this seller, then find orders containing those products.
        
        const Product = require('../models/Product');
        const sellerProducts = await Product.find({ seller: req.params.sellerId }).select('_id');
        const sellerProductIds = sellerProducts.map(p => p._id);
        
        const orders = await Order.find({
            'items.product': { $in: sellerProductIds }
        }).populate('items.product').populate('buyer', 'name');

        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Update Order Status
router.patch('/:id', async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { $set: { status: req.body.status } },
            { new: true }
        );
        res.status(200).json(updatedOrder);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
