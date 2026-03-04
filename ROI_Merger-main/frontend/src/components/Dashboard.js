import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import KPICard from './KPICard';
import ROIChart from './ROIChart';
import BottleneckList from './BottleneckList';
import api from '../services/api';

function Dashboard({ summary }) {
  const [roiData, setRoiData] = useState([]);
  const [bottlenecks, setBottlenecks] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [roi, bottleneckData, recsData] = await Promise.all([
        api.getROI(),
        api.getBottlenecks(),
        api.getResourceRecommendations()
      ]);
      
      setRoiData(roi.roi_metrics || []);
      setBottlenecks(bottleneckData.bottlenecks || []);
      setRecommendations(recsData.recommendations || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="dashboard">
      <div className="kpi-grid">
        <KPICard
          title="Total Revenue"
          value={formatCurrency(summary?.total_revenue || 0)}
          icon="💰"
        />
        <KPICard
          title="Total Firms"
          value={summary?.total_firms || 0}
          icon="🏢"
        />
        <KPICard
          title="Total Staff"
          value={summary?.total_staff || 0}
          icon="👥"
        />
        <KPICard
          title="Average ROI"
          value={`${(summary?.average_roi || 0).toFixed(1)}%`}
          icon="📈"
        />
      </div>

      <div className="charts-section">
        <ROIChart data={roiData} />
      </div>

      <div className="insights-section">
        <BottleneckList bottlenecks={bottlenecks} />
        
        <div className="recommendations-panel">
          <h2>Resource Recommendations</h2>
          {recommendations.length === 0 ? (
            <p className="no-data">No recommendations at this time</p>
          ) : (
            <div className="recommendations-list">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="recommendation-card">
                  <h3>{rec.firm_name}</h3>
                  <p>{rec.reason}</p>
                  <div className="rec-details">
                    <span>Current: {rec.current_staff} staff</span>
                    <span>→</span>
                    <span>Recommended: {rec.recommended_staff} staff</span>
                  </div>
                  <p className="impact">{rec.expected_impact}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
