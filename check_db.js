const cds = require('@sap/cds');

(async () => {
    try {
        const csn = await cds.load('db/schema.cds');
        const db = await cds.connect.to('db');
        db.model = csn;

        const { Products } = db.entities('green.thread');
        const products = await db.run(SELECT.from(Products));
        
        console.log('--- PRODUCTS IN DB ---');
        console.log(JSON.stringify(products, null, 2));
        console.log('----------------------');
        
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
})();
