import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './ROIChart.css';

function ROIChart({ data }) {
  const chartData = data.slice(0, 10).map(item => ({
    name: item.firm_name || `Firm ${item.firm_id}`,
    roi: (item.roi_percentage || 0).toFixed(1),
    revenue: item.revenue || 0
  }));

  return (
    <div className="roi-chart-container">
      <h2>Top 10 Firms by ROI</h2>
      {chartData.length === 0 ? (
        <p className="no-data">No data available</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis label={{ value: 'ROI %', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="roi" fill="#667eea" name="ROI %" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default ROIChart;
