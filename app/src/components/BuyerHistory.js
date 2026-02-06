import React from 'react';
import axios from 'axios';

function BuyerHistory() {
  const [orders, setOrders] = React.useState([]);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  React.useEffect(() => {
    if (user.id) {
        fetchOrders();
        const interval = setInterval(fetchOrders, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }
  }, [user.id]);

  const fetchOrders = async () => {
    try {
      // Fetch directly from Express API which populates products
      const userId = user.id || user._id; // Fallback
      if (!userId) return;
      const res = await axios.get(`/api/orders/buyer/${userId}`);
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
            <h2>My Orders</h2>
            <p>Track your current orders and view history ({user.name})</p>
        </div>
        <button onClick={fetchOrders} style={{ padding: '0.5rem 1rem', background: '#e0e0e0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Refresh</button>
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#7f8c8d' }}>
          <h3>No purchase history found.</h3>
          <p>Once you buy something, it will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map((order) => (
            <div key={order._id} className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                <div>
                    <span style={{ fontWeight: 'bold', color: '#2E7D32' }}>Order #{order._id ? order._id.substring(0, 8) : 'Pending'}</span>
                    <span style={{ margin: '0 1rem', color: '#ccc' }}>|</span>
                    <span style={{ color: '#7f8c8d' }}>{new Date(order.createdAt).toLocaleString()}</span>
                    <div style={{ marginTop: '0.5rem' }}>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        backgroundColor: 
                          order.status === 'Delivered' ? '#e8f5e9' :
                          order.status === 'Shipped' ? '#e3f2fd' :
                          order.status === 'Cancelled' ? '#ffebee' :
                          '#fff3e0',
                        color:
                          order.status === 'Delivered' ? '#2e7d32' :
                          order.status === 'Shipped' ? '#1565c0' :
                          order.status === 'Cancelled' ? '#c62828' :
                          '#ef6c00'
                      }}>
                        Status: {order.status || 'Pending'}
                      </span>
                    </div>
                </div>
                <div style={{ fontWeight: 'bold' }}>Total: ${order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'}</div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {order.items && order.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {item.product ? (
                            <>
                                <img src={item.product.imageUrl || 'https://via.placeholder.com/40'} alt={item.product.name} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                                <span>{item.product.name}</span>
                            </>
                        ) : (
                            <>
                                <div style={{ width: '40px', height: '40px', background: '#ccc', borderRadius: '4px' }}></div>
                                <span style={{ color: 'red' }}>Product Unavailable (ID: {item.product})</span>
                            </>
                        )}
                        <span style={{ marginLeft: 'auto', color: '#7f8c8d' }}>${item.price ? item.price.toFixed(2) : '0.00'} x {item.quantity || 1}</span>
                    </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BuyerHistory;
