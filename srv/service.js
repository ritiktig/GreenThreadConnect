const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {
    
    // ------------------------------------------------------------------------
    // User Service
    // ------------------------------------------------------------------------
    if (this.name === 'UserService') {
        const { Buyers, Sellers } = this.entities;

        // --- Buyer Actions ---
        this.on('registerBuyer', async (req) => {
            const { name, email, region, password } = req.data;
            
            const existingBuyer = await SELECT.one.from(Buyers).where({ email });
            if (existingBuyer) req.error(409, `Buyer with email ${email} already exists`);

            const newBuyer = await INSERT.into(Buyers).entries({
                name, email, region, password
            });
            return newBuyer;
        });

        this.on('loginBuyer', async (req) => {
            const { email, password } = req.data;
            const buyer = await SELECT.one.from(Buyers).where({ email, password });
            if (!buyer) return req.error(401, 'Invalid buyer credentials');
            
            return JSON.stringify({
                token: 'mock-jwt-token-buyer',
                user: {
                    id: buyer.ID,
                    name: buyer.name,
                    email: buyer.email
                }
            });
        });

        // --- Seller Actions ---
        this.on('registerSeller', async (req) => {
            const { name, email, region, password } = req.data;
            
            const existingSeller = await SELECT.one.from(Sellers).where({ email });
            if (existingSeller) req.error(409, `Seller with email ${email} already exists`);

            const newSeller = await INSERT.into(Sellers).entries({
                name, email, region, password
            });
            return newSeller;
        });

        this.on('loginSeller', async (req) => {
            const { email, password } = req.data;
            const seller = await SELECT.one.from(Sellers).where({ email, password });
            if (!seller) return req.error(401, 'Invalid seller credentials');
            
            return JSON.stringify({
                token: 'mock-jwt-token-seller',
                user: {
                    id: seller.ID,
                    name: seller.name,
                    email: seller.email
                }
            });
        });
    }

    // ------------------------------------------------------------------------
    // Product Service
    // ------------------------------------------------------------------------
    if (this.name === 'ProductService') {
        const { Products } = this.entities;

        this.on('predictPrice', async (req) => {
            const { name, material, region } = req.data;
            const { spawn } = require('child_process');
            const path = require('path');
            const fs = require('fs');

            // Logging setup
            const logFile = path.resolve(__dirname, 'server_debug.log');
            const log = (msg) => fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`);

            return new Promise((resolve, reject) => {
                const scriptPath = path.resolve(__dirname, '../ml/price_predictor.py');
                log(`Spawning python script at: ${scriptPath}`);
                
                const pythonProcess = spawn('python', [scriptPath, name, material, region], { shell: true });

                let dataString = '';
                let errorString = '';

                pythonProcess.stdout.on('data', (data) => {
                    dataString += data.toString();
                });

                pythonProcess.stderr.on('data', (data) => {
                    errorString += data.toString();
                    log(`STDERR: ${data}`);
                });

                pythonProcess.on('close', async (code) => {
                    if (code !== 0) {
                        return reject(req.error(500, `Prediction failed: ${errorString}`));
                    }
                    try {
                        const result = JSON.parse(dataString.trim());
                        
                        // Log to DB using external entity access safely
                        // Note: MLLogs is in AnalyticsService or shared? Check schema.
                        // For safety, we skip writing to MLLogs in this turn to avoid crash if entity missing in this service
                        // Or use cds.connect.to('db') if needed. 
                        
                         // To write to MLLogs which is not part of ProductService, we need to access the db service
                        const db = await cds.connect.to('db');
                        const { MLLogs } = db.entities('green.thread');
                        
                         await db.run(INSERT.into(MLLogs).entries({
                            modelType: 'PricePrediction',
                            inputData: JSON.stringify({ name, material, region }),
                            outputData: JSON.stringify(result),
                            confidence: 0.85
                        }));

                        resolve(result.recommended_price);
                    } catch (e) {
                        log(`Parse Error: ${e.message}`);
                        reject(req.error(500, 'Invalid response from ML engine'));
                    }
                });
            });
        });

        this.on('getRecommendations', async (req) => {
            const products = await SELECT.from(Products).limit(5);
            return products;
        });
    }

    // ------------------------------------------------------------------------
    // Order Service
    // ------------------------------------------------------------------------
    if (this.name === 'OrderService') {
        const { Orders, OrderItems } = this.entities;

        this.on('createOrder', async (req) => {
            const fs = require('fs');
            const path = require('path');
            const logOrder = (msg) => fs.appendFileSync(path.resolve(__dirname, 'order_debug.log'), `[${new Date().toISOString()}] ${msg}\n`);
            
            try {
                const { buyerId, addressId, items } = req.data;
                logOrder(`Received createOrder: buyer=${buyerId}, address=${addressId}, items=${JSON.stringify(items)}`);

                let totalAmount = 0;
                const orderItemsToInsert = [];

                // Connect to ProductService or DB
                const db = await cds.connect.to('db');
                const { Products } = db.entities('green.thread');

                for (const item of items) {
                    const product = await db.run(SELECT.one.from(Products).where({ ID: item.productId }));
                    if (!product) {
                        logOrder(`Product not found: ${item.productId}`);
                        req.error(404, `Product ${item.productId} not found`);
                    }
                    
                    const lineTotal = product.price * item.quantity;
                    totalAmount += lineTotal;

                    orderItemsToInsert.push({
                        // parent_ID will be set after order creation
                        product_ID: item.productId,
                        quantity: item.quantity,
                        price: product.price // Save the frozen price
                    });
                }

                logOrder(`Total Amount: ${totalAmount}. Creating order...`);

                const order = await INSERT.into(Orders).entries({
                    buyer_ID: buyerId,
                    shippingAddress_ID: addressId,
                    totalAmount: totalAmount,
                    currency_code: 'USD',
                    status: 'Pending'
                });
                
                const orderId = order.results[0].ID;
                logOrder(`Order created: ${orderId}`);
                
                // Update parent_ID for items
                orderItemsToInsert.forEach(item => item.parent_ID = orderId);

                await INSERT.into(OrderItems).entries(orderItemsToInsert);
                
                return await SELECT.one.from(Orders).where({ ID: orderId });

            } catch (err) {
                fs.appendFileSync(path.resolve(__dirname, 'order_debug.log'), `[ERROR] ${err.message}\n${err.stack}\n`);
                throw err;
            }
        });

        this.on('getSellerOrders', async (req) => {
            const { sellerId } = req.data;
            const db = await cds.connect.to('db');
            const { OrderItems } = db.entities('green.thread');

            // Explicitly selecting and expanding for the frontend
            const items = await db.run(
                SELECT.from(OrderItems)
                .columns(
                    i => {
                        i('*'),
                        i.product(p => p('*')),
                        i.parent(o => {
                            o('*'),
                            o.shippingAddress(a => a('*')),
                            o.buyer(b => {
                                b('*'),
                                b.addresses(a => a('*'))
                            })
                        })
                    }
                )
                .where({ 'product.seller.ID': sellerId })
                .orderBy('parent.createdAt desc')
            );
            
            return items;
        });
    }

    // ------------------------------------------------------------------------
    // Analytics Service
    // ------------------------------------------------------------------------
    if (this.name === 'AnalyticsService') {
        this.on('getTrendForecast', async (req) => {
            const { category } = req.data;
            return JSON.stringify({
                category: category,
                trend: 'Upward',
                forecast: [100, 120, 150, 180]
            });
        });

        this.on('getSalesInsights', async (req) => {
            const { sellerId } = req.data;
            const db = await cds.connect.to('db');
            const { OrderItems, Products } = db.entities('green.thread');

            // 1. Calculate Total Earnings & Products Sold (Real Data)
            // Fetch all order items where the product belongs to this seller and order is not cancelled
            // Note: We need to join with Products to check seller_ID
            
            const sellerItems = await db.run(
                SELECT.from(OrderItems)
                .columns('quantity', 'price')
                .where({ 'product.seller.ID': sellerId })
            );

            let totalEarnings = 0;
            let productsSold = 0;

            sellerItems.forEach(item => {
                totalEarnings += Number(item.price) * item.quantity; // Price at time of order
                productsSold += item.quantity;
            });

            // Mock Data for Charts (Keep until we have enough historical data)
            return JSON.stringify({
                totalEarnings: totalEarnings,
                productsSold: productsSold,
                monthlySales: [
                    { month: 'Jan', sales: 1200 },
                    { month: 'Feb', sales: 1900 },
                    { month: 'Mar', sales: 1500 },
                    { month: 'Apr', sales: 2200 },
                    { month: 'May', sales: 2800 },
                    { month: 'Jun', sales: totalEarnings > 0 ? totalEarnings : 3000 } // Use real if > 0
                ],
                carbonEmissions: [
                    { month: 'Jan', co2: 50 },
                    { month: 'Feb', co2: 45 },
                    { month: 'Mar', co2: 48 },
                    { month: 'Apr', co2: 40 },
                    { month: 'May', co2: 35 },
                    { month: 'Jun', co2: 30 }
                ],
                marketComparison: [
                    { platform: 'My Store', price: 45 },
                    { platform: 'Amazon', price: 55 },
                    { platform: 'Etsy', price: 60 },
                    { platform: 'Flipkart', price: 42 }
                ],
                salesByCategory: [
                    { name: 'Home Decor', value: 400 },
                    { name: 'Clothing', value: 300 },
                    { name: 'Accessories', value: 300 },
                    { name: 'Art', value: 200 }
                ]
            });
        });
    }
});
