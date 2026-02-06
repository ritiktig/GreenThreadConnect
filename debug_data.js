const cds = require('@sap/cds');
const fs = require('fs');

(async () => {
    try {
        const csn = await cds.load('db/schema.cds');
        const db = await cds.connect.to('db');
        db.model = csn;

        const { Products, Sellers } = db.entities('green.thread');

        const sellers = await db.run(SELECT.from(Sellers).columns('ID', 'name', 'email'));
        const products = await db.run(SELECT.from(Products).columns('ID', 'name', 'seller_ID'));

        let output = '=== SELLERS ===\n';
        sellers.forEach(s => output += `${s.ID} | ${s.name} | ${s.email}\n`);

        output += '\n=== PRODUCTS ===\n';
        products.forEach(p => {
             const sellerExists = sellers.find(s => s.ID === p.seller_ID);
             output += `${p.ID} | ${p.name} | Seller_ID: ${p.seller_ID} | Valid Seller? ${sellerExists ? 'YES' : 'NO'}\n`;
        });

        fs.writeFileSync('data_debug_report.txt', output);
        console.log('Report generated: data_debug_report.txt');

    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
})();
