const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });
const User = require('./server/models/User');
const Order = require('./server/models/Order');

async function debugDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // 1. List Users
        const users = await User.find();
        console.log('\n--- 👥 Users in DB ---');
        users.forEach(u => {
            console.log(`ID: ${u._id} | Name: ${u.name} | Email: ${u.email}`);
        });

        // 2. List Orders
        const orders = await Order.find();
        console.log('\n--- 📦 Orders in DB ---');
        orders.forEach(o => {
            console.log(`Order ID: ${o._id}`);
            console.log(`   Buyer ID stored: ${o.buyer}`);
            
            // Check if buyer exists
            const matchingUser = users.find(u => u._id.toString() === o.buyer.toString());
            if (matchingUser) {
                console.log(`   ✅ Matched Buyer: ${matchingUser.name}`);
            } else {
                console.log(`   ❌ BUYER NOT FOUND IN USERS! (Or ID mismatch)`);
            }
            
            console.log(`   Items: ${o.items.length}`);
            console.log(`   Total: ${o.totalAmount}`);
            console.log('--------------------------------');
        });

    } catch (err) {
        console.error('❌ Debug Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

debugDatabase();
