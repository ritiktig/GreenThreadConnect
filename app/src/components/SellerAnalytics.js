import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import './SellerAnalytics.css';

function SellerAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user.id) return;
        const response = await axios.post('/api/analytics/getSalesInsights', { sellerId: user.id });
        setData(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
            <div className="value">${data?.totalEarnings?.toLocaleString() || '0'}</div>
        </div>
        <div className="card">
            <h3>Products Sold</h3>
            <div className="value">{data?.productsSold || 0}</div>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart-wrapper">
            <h3>Monthly Sales Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data?.monthlySales || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sales" fill="#27ae60" name="Sales ($)" />
                </BarChart>
            </ResponsiveContainer>
        </div>

        <div className="chart-wrapper">
            <h3>Carbon Emissions (kg CO2)</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data?.carbonEmissions || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="co2" stroke="#e67e22" strokeWidth={2} name="CO2 Emissions" />
                </LineChart>
            </ResponsiveContainer>
        </div>

        <div className="chart-wrapper">
            <h3>Market Price Comparison ($)</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data?.marketComparison || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="platform" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="price" fill="#8e44ad" name="Avg Price" />
                </BarChart>
            </ResponsiveContainer>
        </div>

        <div className="chart-wrapper">
            <h3>Sales by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data?.salesByCategory || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {data?.salesByCategory?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4]} />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default SellerAnalytics;
