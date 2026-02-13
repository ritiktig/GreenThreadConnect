import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { useCurrency } from '../context/CurrencyContext';

function SellerHistory() {
  const { formatPrice } = useCurrency();
  const [history, setHistory] = useState([]);
  useEffect(() => {
    const fetchHistory = async () => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                const res = await axios.get(`/api/orders/seller/${user.id}`);
                const orders = res.data;

                // Flatten orders to get individual sales items for this seller
                const sales = [];
                orders.forEach(order => {
                    order.items.forEach(item => {
                        // Check if this item belongs to the current seller
                        // item.product might be populated (object) or just ID (string)
                        // The endpoint should populate 'product', so we check item.product.seller
                        // But wait, the endpoint populates 'items.product'. 
                        // If item.product is null (deleted product), we handle it.
                        
                        if (item.product && (item.product.seller === user.id || item.product.seller._id === user.id)) {
                             sales.push({
                                 product: item.product,
                                 quantity: item.quantity,
                                 totalAmount: item.price * item.quantity,
                                 buyerName: order.buyer ? order.buyer.name : 'Unknown Buyer',
                                 paymentMethod: order.paymentMethod || 'Card',
                                 orderId: order._id,
                                 date: order.createdAt
                             });
                        }
                    });
                });

                // Sort by date new to old
                sales.sort((a, b) => new Date(b.date) - new Date(a.date));

                setHistory(sales);
            }
        } catch (err) {
            console.error("Failed to fetch history", err);
        }
    };
    fetchHistory();
  }, []);

  return (
    <div className="seller-history">
      <h3>Sales History</h3>
      {history.length === 0 ? (
        <p>No sales yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
              <th style={{ padding: '1rem' }}>Product</th>
              <th style={{ padding: '1rem' }}>Quantity</th>
              <th style={{ padding: '1rem' }}>Total Amount</th>
              <th style={{ padding: '1rem' }}>Buyer</th>
              <th style={{ padding: '1rem' }}>Payment</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 'bold' }}>{item.product?.name || 'Unknown'}</div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>Order #{item.orderId.substring(0,8)}</div>
                </td>
                <td style={{ padding: '1rem' }}>{item.quantity}</td>
                <td style={{ padding: '1rem', color: '#2e7d32', fontWeight: 'bold' }}>{formatPrice(item.totalAmount)}</td>
                <td style={{ padding: '1rem' }}>{item.buyerName}</td>
                <td style={{ padding: '1rem' }}>{item.paymentMethod}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default SellerHistory;
