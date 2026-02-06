const mongoose = require('mongoose');
require('dotenv').config(); // Picks up .env in server/
const User = require('./models/User');
const Order = require('./models/Order');

const fs = require('fs');

async function debugDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const results = { users: [], orders: [] };

        // 1. List Users
        const users = await User.find();
        results.users = users.map(u => ({ id: u._id, name: u.name, email: u.email }));

        // 2. List Orders
        const orders = await Order.find();
        results.orders = orders.map(o => {
            const matchingUser = users.find(u => u._id.toString() === o.buyer?.toString());
            return {
                id: o._id,
                buyer: o.buyer,
                matchedBuyer: matchingUser ? matchingUser.name : 'MISMATCH',
                items: o.items,
                total: o.totalAmount,
                status: o.status
            };
        });

        fs.writeFileSync('debug_results.json', JSON.stringify(results, null, 2));
        console.log('Results written to debug_results.json');

    } catch (err) {
        fs.writeFileSync('debug_error.txt', err.toString());
    } finally {
        await mongoose.disconnect();
    }
}

debugDatabase();
