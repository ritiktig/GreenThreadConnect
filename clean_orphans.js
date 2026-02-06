const cds = require('@sap/cds');

(async () => {
    try {
        const csn = await cds.load('db/schema.cds');
        const db = await cds.connect.to('db');
        db.model = csn;

        console.log('Deleting orphan product "b7bb6e43-238c-4e90-b3a2-0a0ad0362597"...');
        const deleted = await db.run(DELETE.from('green.thread.Products').where({ ID: 'b7bb6e43-238c-4e90-b3a2-0a0ad0362597' }));
        console.log(`Deleted ${deleted} items.`);

    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
})();
