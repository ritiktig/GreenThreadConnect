import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import './SellerAnalytics.css';

import { useCurrency } from '../context/CurrencyContext';

function SellerAnalytics() {
  const { formatPrice, convertPrice, currency, symbol } = useCurrency();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Helper to convert data for charts
  const getConvertedData = () => {
    if (!data) return null;
    return {
        ...data,
        totalEarnings: convertPrice(data.totalEarnings),
        monthlySales: data.monthlySales.map(d => ({ ...d, sales: convertPrice(d.sales) })),
        marketComparison: data.marketComparison.map(d => ({ ...d, price: convertPrice(d.price) })),
        // co2 and other non-monetary data remain same
    };
  };

  const convertedData = getConvertedData();

  useEffect(() => {
    const fetchAnalytics = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user.id) {
                const res = await axios.post('/api/analytics/getSalesInsights', { sellerId: user.id });
                setData(res.data);
            }
        } catch (err) {
            console.error("Failed to fetch analytics:", err);
            setError("Failed to load analytics data.");
        } finally {
            setLoading(false);
        }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <div className="analytics-loading">Loading Dashboard...</div>;
  if (error) return <div className="analytics-error">{error}</div>;
  if (!data) return null;

  return (
    <div className="analytics-container">
      <h2>Seller Analytics Dashboard</h2>
      
      <div className="stats-cards">
        <div className="card">
            <h3>Total Earnings</h3>
            <div className="value">{formatPrice(data.totalEarnings)}</div>
        </div>
        <div className="card">
            <h3>Products Sold</h3>
            <div className="value">{data.productsSold || 0}</div>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart-wrapper">
            <h3>Monthly Sales Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={convertedData.monthlySales || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${symbol}${value}`} />
                    <Legend />
                    <Bar dataKey="sales" fill="#27ae60" name={`Sales (${symbol})`} />
                </BarChart>
            </ResponsiveContainer>
        </div>

        <div className="chart-wrapper">
            <h3>Carbon Emissions (kg CO2)</h3>
            {data.carbonEmissions && data.carbonEmissions.some(d => d.co2 > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.carbonEmissions || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="co2" fill="#e67e22" name="CO2 Emissions" />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                    No carbon emission data available yet.
                </div>
            )}
        </div>

        <div className="chart-wrapper">
            <h3>Market Price Comparison ({symbol})</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={convertedData.marketComparison || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="platform" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${symbol}${value}`} />
                    <Legend />
                    <Bar dataKey="price" fill="#8e44ad" name="Avg Price" />
                </BarChart>
            </ResponsiveContainer>
        </div>

        <div className="chart-wrapper">
            <h3>Sales by Category</h3>
            {data.salesByCategory && data.salesByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={data.salesByCategory}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {data.salesByCategory.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                    No sales data available yet.
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default SellerAnalytics;
