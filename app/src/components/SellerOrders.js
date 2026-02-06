import React, { useState, useEffect } from 'react';
import axios from 'axios';

function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchOrders(); // Initial fetch
    const interval = setInterval(fetchOrders, 5000); // Poll every 5 seconds
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const fetchOrders = async () => {
    try {
      console.log('Fetching orders for seller:', user.id);
      const res = await axios.get(`/api/orders/seller/${user.id}`);
      
      // Flatten orders into items for the table view
      // Each item needs to reference its parent order for status/buyer info
      const flattenedItems = res.data.flatMap(order => 
          order.items.map(item => ({
              ...item,
              parent: order // Attach parent order info
          }))
      );
      
      console.log('Orders items flattened:', flattenedItems);
      setOrders(flattenedItems);
    } catch (err) {
      console.error("Failed to fetch seller orders", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
      try {
          await axios.patch(`/api/orders/${orderId}`, { status: newStatus });
          alert(`Order status updated to ${newStatus}`);
          fetchOrders(); // Refresh
      } catch (err) {
          console.error("Failed to update status", err);
          alert("Failed to update status");
      }
  };

  const downloadOrder = (item) => {
      const buyer = item.parent?.buyer;
      const address = item.parent?.shippingAddress;
      const product = item.product;
      const total = (item.price * item.quantity).toFixed(2);
      const date = item.parent?.createdAt ? new Date(item.parent.createdAt).toLocaleString() : 'N/A';

      const content = `
ORDER DETAILS
----------------------------
Order ID: ${item.parent?.ID}
Date: ${date}
Status: ${item.parent?.status}

PRODUCT
----------------------------
Name: ${product?.name}
ID: ${product?._id}
Quantity: ${item.quantity}
Unit Price: $${Number(item.price).toFixed(2)}
Total: $${total}

BUYER
----------------------------
Name: ${buyer?.name || 'Guest'}
Email: ${buyer?.email || 'N/A'}

SHIPPING ADDRESS
----------------------------
${address ? `${address.street}
${address.city}, ${address.state} ${address.zipCode}
${address.type}` : 'N/A'}
      `.trim();

      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Order_${item.parent?.ID.substring(0,8)}.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
  };

  if (loading) return <div>Loading Orders...</div>;

  return (
    <div className="seller-orders">
      <h3>Ordered Products</h3>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
              <th style={{ padding: '1rem', borderBottom: '2px solid #eee' }}>Product</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid #eee' }}>Qty / Total</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid #eee' }}>Buyer Details</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid #eee' }}>Date</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid #eee' }}>Status / Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(item => {
                const buyer = item.parent?.buyer;
                const address = item.parent?.shippingAddress || (buyer?.addresses && buyer.addresses.length > 0 ? buyer.addresses[0] : null);
                const orderId = item.parent?._id;
                const currentStatus = item.parent?.status || 'Pending';

                return (
                  <tr key={item._id || `${item.product?._id}-${item.parent?._id}`} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <img src={item.product?.imageUrl || 'https://via.placeholder.com/40'} alt={item.product?.name} style={{ width: '50px', height: '50px', borderRadius: '4px', objectFit: 'cover' }} />
                            <div>
                                <div style={{ fontWeight: 'bold' }}>{item.product?.name || 'Unknown'}</div>
                                <div style={{ fontSize: '0.85rem', color: '#666' }}>ID: {item.product?._id?.substring(0,6)}...</div>
                            </div>
                        </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                        <div>Qty: <strong>{item.quantity}</strong></div>
                        <div style={{ color: '#2e7d32', fontWeight: 'bold' }}>${(item.price * item.quantity).toFixed(2)}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                        {buyer ? (
                            <div>
                                <strong>{buyer.name}</strong><br/>
                                <span style={{ fontSize: '0.85rem', color: '#666' }}>{buyer.email}</span>
                                {address && (
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', borderLeft: '2px solid #ddd', paddingLeft: '0.5rem' }}>
                                        {address.street}, {address.city}<br/>
                                        {address.state}, {address.zipCode}
                                    </div>
                                )}
                            </div>
                        ) : 'Guest/Unknown'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                        {item.parent?.createdAt ? new Date(item.parent.createdAt).toLocaleDateString() : 'N/A'}<br/>
                        <span style={{ fontSize: '0.8rem', color: '#888' }}>
                            {item.parent?.createdAt ? new Date(item.parent.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                        </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <select 
                                value={currentStatus} 
                                onChange={(e) => handleStatusUpdate(orderId, e.target.value)}
                                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', width: '100%' }}
                            >
                                <option value="Pending">Pending</option>
                                <option value="Paid">Paid</option>
                                <option value="Packed">Packed</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                            <button 
                                onClick={() => downloadOrder(item)}
                                style={{ 
                                    padding: '0.5rem', 
                                    background: '#2c3e50', 
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '4px', 
                                    cursor: 'pointer',
                                    fontSize: '0.85rem' 
                                }}
                            >
                                ⬇ Download Details
                            </button>
                        </div>
                    </td>
                  </tr>
                );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default SellerOrders;
