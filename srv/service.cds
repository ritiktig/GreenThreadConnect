using { green.thread as db } from '../db/schema';

@path: '/user'
service UserService {
    @readonly entity Buyers as projection on db.Buyers;
    @readonly entity Sellers as projection on db.Sellers;
    entity Addresses as projection on db.Addresses;
    
    action registerBuyer(name: String, email: String, region: String, password: String) returns Buyers;
    action registerSeller(name: String, email: String, region: String, password: String) returns Sellers;
    
    action loginBuyer(email: String, password: String) returns String; // Returns JWT token (mock)
    action loginSeller(email: String, password: String) returns String; // Returns JWT token (mock)
}

@path: '/product'
service ProductService {
    // Publicly readable, but write restricted to Sellers
    entity Products as projection on db.Products;
    @readonly entity Sellers as projection on db.Sellers;
    
    // ML Integration Actions
    action predictPrice(name: String, material: String, region: String) returns Decimal(10,2);
    action getRecommendations(buyerId: UUID) returns array of Products;
}

@path: '/order'
service OrderService {
    entity Orders as projection on db.Orders;
    entity OrderItems as projection on db.OrderItems;
    
    action createOrder(buyerId: UUID, addressId: UUID, items: array of { productId: UUID; quantity: Integer; }) returns Orders;
    function getSellerOrders(sellerId: UUID) returns array of OrderItems;
}

@path: '/analytics'
service AnalyticsService {
    @readonly entity MLLogs as projection on db.MLLogs;
    function getTrendForecast(category: String) returns String; // Returns JSON string of forecast
    action getSalesInsights(sellerId: UUID) returns String; // Returns JSON string of stats
}
