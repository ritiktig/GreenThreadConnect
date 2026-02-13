const mongoose = require('mongoose');
require('dotenv').config({path: './server/.env'});

const uri = process.env.MONGODB_URI;
console.log("Testing connection...");

mongoose.set('strictQuery', true);

mongoose.connect(uri)
.then(() => { 
    console.log("✅ SUCCESS: Connected to MongoDB Atlas!"); 
    process.exit(0); 
})
.catch(err => { 
    console.error("❌ FAILURE: Could not connect.");
    console.error(err); 
    process.exit(1); 
});
