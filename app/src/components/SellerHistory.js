import React, { useState, useEffect } from 'react';
import axios from 'axios';

function SellerHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      // Re-using the seller orders endpoint as it fetches all orders containing seller's products
      const res = await axios.get(`/api/orders/seller/${user.id}`);
      
      // Flatten and process for history view
      const flattenedItems = res.data.flatMap(order => 
          order.items.map(item => ({
              ...item,
              orderId: order._id,
              buyerName: order.buyer?.name || 'Guest',
              paymentMethod: order.paymentMethod || 'Credit Card', // Default if missing
              totalAmount: item.price * item.quantity,
              date: order.createdAt
          }))
      );
      
      setHistory(flattenedItems);
    } catch (err) {
      console.error("Failed to fetch history", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading History...</div>;

  return (
    <div className="seller-history">
      <h3>Sales History</h3>
      {history.length === 0 ? (
        <p>No sales history found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
              <th style={{ padding: '1rem', borderBottom: '2px solid #eee' }}>Product</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid #eee' }}>Qty</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid #eee' }}>Total Amount</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid #eee' }}>Buyer Name</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid #eee' }}>Payment Method</th>
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
                <td style={{ padding: '1rem', color: '#2e7d32', fontWeight: 'bold' }}>${item.totalAmount.toFixed(2)}</td>
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
