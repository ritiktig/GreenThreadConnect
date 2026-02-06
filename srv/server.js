const cds = require('@sap/cds');

cds.on('bootstrap', app => {
    // Increase payload limit for Base64 images
    const express = require('express');
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));
});

module.exports = cds.server;
