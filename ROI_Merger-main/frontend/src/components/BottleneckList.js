import React from 'react';
import './BottleneckList.css';

function BottleneckList({ bottlenecks }) {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#3498db';
      default: return '#95a5a6';
    }
  };

  return (
    <div className="bottleneck-list">
      <h2>Identified Bottlenecks</h2>
      {bottlenecks.length === 0 ? (
        <p className="no-data">No bottlenecks detected</p>
      ) : (
        <div className="bottleneck-items">
          {bottlenecks.map((bottleneck, idx) => (
            <div key={idx} className="bottleneck-item">
              <div
                className="severity-indicator"
                style={{ backgroundColor: getSeverityColor(bottleneck.severity) }}
              />
              <div className="bottleneck-content">
                <h3>{bottleneck.firm_name || `Firm ${bottleneck.firm_id}`}</h3>
                <p className="description">{bottleneck.description || bottleneck.reason}</p>
                <p className="recommendation">{bottleneck.recommendation || "Strategy review suggested"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BottleneckList;
