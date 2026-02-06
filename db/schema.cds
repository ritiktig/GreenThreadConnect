namespace green.thread;

using { managed, cuid, Currency } from '@sap/cds/common';

// ----------------------------------------------------------------------------
// Users & Roles
// ----------------------------------------------------------------------------

// Separated Buyers Entity
entity Buyers : cuid, managed {
    name     : String(100);
    email    : String(100) @assert.format: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$';
    region   : String(50);
    password : String(100); // In real app, use SAP XSUAA / IAS
    orders   : Association to many Orders on orders.buyer = $self;
    addresses: Association to many Addresses on addresses.parent = $self;
}


entity Addresses : cuid, managed {
    parent   : Association to Buyers;
    street   : String(100);
    city     : String(50);
    state    : String(50);
    zipCode  : String(20);
    type     : String(20); // Home, Office, Other
}

// Separated Sellers Entity
entity Sellers : cuid, managed {
    name     : String(100);
    email    : String(100) @assert.format: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$';
    region   : String(50);
    password : String(100); // In real app, use SAP XSUAA / IAS
    products : Association to many Products on products.seller = $self;
}

// ----------------------------------------------------------------------------
// Products
// ----------------------------------------------------------------------------
entity Products : cuid, managed {
    name                 : String(100);
    description          : String(1000);
    material             : String(50); // e.g., Bamboo, Jute, Cotton
    dimensions           : String(50);
    region               : String(50);
    category             : String(50);
    price                : Decimal(10,2);
    currency             : Currency;
    stock                : Integer;
    sustainabilityRating : Integer; // 1-5 scale
    imageUrl             : LargeString;
    seller               : Association to Sellers;
}

// ----------------------------------------------------------------------------
// Orders
// ----------------------------------------------------------------------------
entity Orders : cuid, managed {
    buyer       : Association to Buyers;
    totalAmount : Decimal(10,2);
    currency    : Currency;
    status      : String(20) enum { Pending; Paid; Shipped; Delivered; Cancelled; };
    shippingAddress : Association to Addresses;
    items       : Composition of many OrderItems on items.parent = $self;
}

entity OrderItems : cuid {
    parent  : Association to Orders;
    product : Association to Products;
    quantity: Integer;
    price   : Decimal(10,2); // Snapshot of price at time of order
}

// ----------------------------------------------------------------------------
// ML & Analytics
// ----------------------------------------------------------------------------
entity MLLogs : cuid, managed {
    modelType : String(50); // 'PricePrediction', 'Recommendation', 'Trend'
    inputData : LargeString;
    outputData: LargeString;
    confidence: Decimal(5,4);
}

