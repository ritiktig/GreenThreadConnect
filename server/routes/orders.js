const router = require('express').Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Create Order (Authenticated Buyers Only)
router.post('/', authenticateToken, authorizeRoles('buyer'), async (req, res) => {
    try {
        console.log('📦 Receiving Order Request:', req.body);
        
        // Auto-assign authenticated user as the buyer to prevent spoofing
        const orderData = { ...req.body, buyer: req.user.id };
        const newOrder = new Order(orderData);
        const savedOrder = await newOrder.save();
        console.log('✅ Order Saved:', savedOrder._id);
        res.status(201).json(savedOrder);
    } catch (err) {
        console.error('❌ Order Save Failed:', err);
        res.status(500).json({ message: "Failed to place order" });
    }
});

// Get Buyer Orders (Authenticated Buyers Only - must match own ID)
router.get('/buyer/:buyerId', authenticateToken, authorizeRoles('buyer'), async (req, res) => {
    try {
        if (req.params.buyerId !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized access: buyer ID mismatch" });
        }

        console.log(`🔍 Fetching orders for buyer: ${req.user.id}`);
        const orders = await Order.find({ buyer: req.user.id })
                             .populate('items.product')
                             .sort({ createdAt: -1 });
        
        console.log(`✅ Found ${orders.length} orders for buyer ${req.user.id}`);
        res.status(200).json(orders);
    } catch (err) {
        console.error('❌ Error fetching buyer orders:', err);
        res.status(500).json({ message: "Failed to retrieve orders" });
    }
});

// Get Seller Orders (Authenticated Sellers Only - must match own ID)
router.get('/seller/:sellerId', authenticateToken, authorizeRoles('seller'), async (req, res) => {
    try {
        if (req.params.sellerId !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized access: seller ID mismatch" });
        }

        const sellerProducts = await Product.find({ seller: req.user.id }).select('_id');
        const sellerProductIds = sellerProducts.map(p => p._id);
        
        const orders = await Order.find({
            'items.product': { $in: sellerProductIds }
        }).populate('items.product').populate('buyer', 'name');

        res.status(200).json(orders);
    } catch (err) {
        console.error('❌ Error fetching seller orders:', err);
        res.status(500).json({ message: "Failed to retrieve seller orders" });
    }
});

// Update Order Status (Authenticated Sellers Only)
router.patch('/:id', authenticateToken, authorizeRoles('seller'), async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('items.product');
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Verify that this seller owns at least one product in the order
        const sellerProducts = await Product.find({ seller: req.user.id }).select('_id');
        const sellerProductIds = sellerProducts.map(p => p._id.toString());
        
        const hasSellerProduct = order.items.some(item => 
            item.product && sellerProductIds.includes(item.product._id.toString())
        );

        if (!hasSellerProduct) {
            return res.status(403).json({ message: "Unauthorized access: Order does not contain your products" });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { $set: { status: req.body.status } },
            { new: true }
        );
        res.status(200).json(updatedOrder);
    } catch (err) {
        console.error('❌ Order update failed:', err);
        res.status(500).json({ message: "Failed to update order status" });
    }
});

module.exports = router;

