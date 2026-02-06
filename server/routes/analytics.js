const router = require('express').Router();

const Product = require('../models/Product');
const Order = require('../models/Order');

// Get Sales Insights (Real Data + Mock Trends)
router.post('/getSalesInsights', async (req, res) => {
    try {
        const { sellerId } = req.body;
        
        // 1. Find all products by this seller
        const sellerProducts = await Product.find({ seller: sellerId }).select('_id');
        const sellerProductIds = sellerProducts.map(p => p._id.toString());
        
        // 2. Find all orders containing these products
        // We need to look at 'items.product'
        const orders = await Order.find({
            'items.product': { $in: sellerProductIds }
        });

        // 3. Calculate Totals & Monthly Aggregation
        let totalEarnings = 0;
        let productsSold = 0;
        const monthlyData = {};

        // Initialize last 6 months
        for (let i = 0; i < 6; i++) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthName = d.toLocaleString('default', { month: 'short' });
            monthlyData[monthName] = 0;
        }

        orders.forEach(order => {
            const orderDate = new Date(order.createdAt);
            const month = orderDate.toLocaleString('default', { month: 'short' });

            order.items.forEach(item => {
                if (sellerProductIds.includes(item.product.toString())) {
                    productsSold += item.quantity;
                    const amount = item.price * item.quantity;
                    totalEarnings += amount;

                    // Aggregate Monthly
                    if (monthlyData.hasOwnProperty(month)) {
                        monthlyData[month] += amount;
                    }
                }
            });
        });

        // Format for Chart (Reversed to show chronological order)
        const monthlySales = Object.keys(monthlyData).reverse().map(month => ({
            month,
            sales: monthlyData[month]
        }));

        const data = {
            totalEarnings: totalEarnings,
            productsSold: productsSold,
            monthlySales: monthlySales, // Real Data
            carbonEmissions: [
                { month: 'Jan', co2: 50 },
                { month: 'Feb', co2: 45 },
                { month: 'Mar', co2: 60 },
                { month: 'Apr', co2: 55 }
            ],
            marketComparison: [
                { platform: 'Amazon', price: 60 },
                { platform: 'Etsy', price: 55 },
                { platform: 'GreenThread', price: 45 }
            ],
            salesByCategory: [
                { name: 'Bamboo', value: 400 },
                { name: 'Pottery', value: 300 },
                { name: 'Textile', value: 300 },
                { name: 'Wood', value: 200 }
            ]
        };
        res.status(200).json(data);
    } catch (err) {
        console.error("Analytics Error:", err);
        res.status(500).json(err);
    }
});

module.exports = router;
