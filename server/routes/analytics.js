const router = require('express').Router();

const Product = require('../models/Product');
const Order = require('../models/Order');

// Get Sales Insights (Real Data + Mock Trends)
// Get Sales Insights (Real Data)
router.post('/getSalesInsights', async (req, res) => {
    try {
        const { sellerId } = req.body;
        console.log("Fetching analytics for seller:", sellerId);
        
        // 1. Find all products by this seller
        const sellerProducts = await Product.find({ seller: sellerId }).select('_id category carbonFootprint');
        const sellerProductIds = sellerProducts.map(p => p._id.toString());
        
        // Map for quick lookup of product details
        const productMap = {};
        sellerProducts.forEach(p => {
            productMap[p._id.toString()] = {
                category: p.category || 'Uncategorized',
                carbonFootprint: p.carbonFootprint || 0
            };
        });
        
        // 2. Find all orders containing these products
        const orders = await Order.find({
            'items.product': { $in: sellerProductIds }
        });

        // 3. Initialize Aggregates
        let totalEarnings = 0;
        let productsSold = 0;
        const monthlyData = {};
        const monthlyCo2 = {};
        const categorySales = {};

        // Initialize last 6 months
        for (let i = 0; i < 6; i++) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthName = d.toLocaleString('default', { month: 'short' });
            monthlyData[monthName] = 0;
            monthlyCo2[monthName] = 0;
        }

        // 4. Single Pass Loop
        orders.forEach(order => {
            const orderDate = new Date(order.createdAt);
            const month = orderDate.toLocaleString('default', { month: 'short' });

            order.items.forEach(item => {
                if (!item.product) return; // Skip if product is missing
                
                const productId = item.product.toString();
                
                if (sellerProductIds.includes(productId)) {
                    const quantity = item.quantity || 0;
                    const price = item.price || 0;
                    const amount = price * quantity;
                    
                    const productDetails = productMap[productId];
                    const co2 = (productDetails ? productDetails.carbonFootprint : 0) * quantity;
                    const category = productDetails ? productDetails.category : 'Uncategorized';

                    // Update Totals
                    productsSold += quantity;
                    totalEarnings += amount;

                    // Update Monthly Sales
                    if (monthlyData.hasOwnProperty(month)) {
                        monthlyData[month] += amount;
                    }

                    // Update Monthly CO2
                    if (monthlyCo2.hasOwnProperty(month)) {
                        monthlyCo2[month] += co2;
                    }

                    // Update Category Sales
                    if (!categorySales[category]) {
                        categorySales[category] = 0;
                    }
                    categorySales[category] += amount;
                }
            });
        });

        // 5. Format Data for Frontend
        const monthlySales = Object.keys(monthlyData).reverse().map(month => ({
            month,
            sales: monthlyData[month]
        }));

        const carbonEmissions = Object.keys(monthlyCo2).reverse().map(month => ({
            month,
            co2: monthlyCo2[month]
        }));

        const salesByCategory = Object.keys(categorySales).map(category => ({
            name: category,
            value: categorySales[category]
        }));

        const data = {
            totalEarnings: totalEarnings,
            productsSold: productsSold,
            monthlySales: monthlySales,
            carbonEmissions: carbonEmissions,
            marketComparison: [
                { platform: 'Amazon', price: 60 },
                { platform: 'Etsy', price: 55 },
                { platform: 'GreenThread', price: 45 }
            ],
            salesByCategory: salesByCategory
        };
        
        res.status(200).json(data);
    } catch (err) {
        console.error("Analytics Error:", err);
        res.status(500).json({ message: "Failed to load analytics", error: err.message });
    }
});

module.exports = router;
