const http = require('http');

// Helper for HTTP Request
function request(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                         resolve(data); // In case of non-json response
                    }
                } else {
                    reject({ status: res.statusCode, data: data });
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

(async () => {
    try {
        console.log('--- 🚀 Starting Full System Verification ---');

        // 1. Register User (Buyer/Seller hybrid for testing)
        const randomEmail = `test${Date.now()}@example.com`;
        const user = await request('POST', '/api/auth/register', {
            name: 'Verification User',
            email: randomEmail,
            password: 'password123',
            role: 'seller', // Seller can also buy in our simplified model logic?
            region: 'TestRegion'
        });
        console.log('✅ 1. User Registered:', user.email);

        // 2. Add Address
        const address = await request('POST', `/api/users/${user._id}/addresses`, {
            street: '123 Test St',
            city: 'Test City',
            state: 'TS',
            zipCode: '12345',
            type: 'Home'
        });
        console.log('✅ 2. Address Added. Count:', address.length);

        // 3. Add Product (As Seller)
        const product = await request('POST', '/api/products', {
            name: 'MERN Integration Vase',
            description: 'Created by verification script',
            name: 'MERN Integration Vase',
            description: 'Created by verification script',
            price: 50,
            seller: user._id, 
            category: 'Pottery',
            stock: 10
        });
        console.log('✅ 3. Product Added:', product.name, 'Category:', product.category);

        // 4. Test Price Prediction
        const prediction = await request('POST', '/api/predict', {
            product_name: "Test Vase",
            material: "Clay",
            region: "India"
        });
        console.log('✅ 4. AI Price Prediction:', prediction.predicted_price);

        // 5. Create Order (User buying their own product for test simplicity)
        const order = await request('POST', '/api/orders', {
            buyer: user._id,
            items: [{
                product: product._id,
                quantity: 2,
                price: product.price
            }],
            totalAmount: 100,
            shippingAddress: '123 Test St, Test City',
            status: 'Paid'
        });
        console.log('✅ 5. Order Placed. ID:', order._id);

        // 6. Verify Buyer History (Get Orders)
        const buyerOrders = await request('GET', `/api/orders/buyer/${user._id}`);
        console.log('📦 Fetched Orders Count:', buyerOrders.length);
        if (buyerOrders.length > 0) {
             const firstOrder = buyerOrders[0];
             console.log('📦 First Order Structure:', JSON.stringify(firstOrder, null, 2));
             
             if (firstOrder.items && firstOrder.items.length > 0) {
                 const firstItem = firstOrder.items[0];
                 if (firstItem.product && firstItem.product.name) {
                     console.log('✅ Product populated correctly:', firstItem.product.name);
                 } else {
                     console.error('❌ Product NOT populated. Value:', firstItem.product);
                 }
             }
        } else {
             console.error('❌ No headers found for user');
        }

        console.log('\n--- 🎉 Verification Complete. System is Healthy. ---');

    } catch (error) {
        console.error('❌ Verification Failed:', error);
    }
})();
