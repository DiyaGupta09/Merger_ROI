import React, { useState } from 'react';
import './MergerAnalysis.css';
import api from '../services/api';

function MergerAnalysis() {
  const [companyA, setCompanyA] = useState('');
  const [companyB, setCompanyB] = useState('');
  const [searchResultsA, setSearchResultsA] = useState([]);
  const [searchResultsB, setSearchResultsB] = useState([]);
  const [selectedFirmA, setSelectedFirmA] = useState(null);
  const [selectedFirmB, setSelectedFirmB] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchCompanies = async (query, setResults) => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    
    try {
      const data = await api.searchFirms(query);
      setResults(data.firms || []);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const handleCompanyAChange = (e) => {
    const value = e.target.value;
    setCompanyA(value);
    searchCompanies(value, setSearchResultsA);
  };

  const handleCompanyBChange = (e) => {
    const value = e.target.value;
    setCompanyB(value);
    searchCompanies(value, setSearchResultsB);
  };

  const selectFirmA = (firm) => {
    setSelectedFirmA(firm);
    setCompanyA(firm.firm_name);
    setSearchResultsA([]);
  };

  const selectFirmB = (firm) => {
    setSelectedFirmB(firm);
    setCompanyB(firm.firm_name);
    setSearchResultsB([]);
  };

  const analyzeMerger = async () => {
    if (!selectedFirmA || !selectedFirmB) {
      setError('Please select both companies');
      return;
    }

    if (selectedFirmA.firm_id === selectedFirmB.firm_id) {
      setError('Please select two different companies');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await api.analyzeMerger(selectedFirmA.firm_id, selectedFirmB.firm_id);
      setAnalysis(result);
    } catch (err) {
      setError('Failed to analyze merger: ' + err.message);
    } finally {
      setLoading(false);
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
    <div className="merger-analysis">
      <h2>Merger ROI Analysis</h2>
      
      <div className="company-selection">
        <div className="company-input-group">
          <label>Company A</label>
          <input
            type="text"
            value={companyA}
            onChange={handleCompanyAChange}
            placeholder="Type company name..."
            className="company-input"
          />
          {searchResultsA.length > 0 && (
            <div className="search-results">
              {searchResultsA.map(firm => (
                <div
                  key={firm.firm_id}
                  className="search-result-item"
                  onClick={() => selectFirmA(firm)}
                >
                  {firm.firm_name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="merger-icon">+</div>

        <div className="company-input-group">
          <label>Company B</label>
          <input
            type="text"
            value={companyB}
            onChange={handleCompanyBChange}
            placeholder="Type company name..."
            className="company-input"
          />
          {searchResultsB.length > 0 && (
            <div className="search-results">
              {searchResultsB.map(firm => (
                <div
                  key={firm.firm_id}
                  className="search-result-item"
                  onClick={() => selectFirmB(firm)}
                >
                  {firm.firm_name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        className="analyze-button"
        onClick={analyzeMerger}
        disabled={!selectedFirmA || !selectedFirmB || loading}
      >
        {loading ? 'Analyzing...' : 'Analyze Merger'}
      </button>

      {error && <div className="error-message">{error}</div>}

      {analysis && (
        <div className="analysis-results">
          <div className="result-header">
            <h3>Merger Analysis Results</h3>
            <span className={`recommendation ${analysis.recommendation.toLowerCase()}`}>
              {analysis.recommendation}
            </span>
          </div>

          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">Combined Revenue</div>
              <div className="metric-value">{formatCurrency(analysis.combined_revenue)}</div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Combined Costs</div>
              <div className="metric-value">{formatCurrency(analysis.combined_costs)}</div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Estimated Synergies</div>
              <div className="metric-value success">{formatCurrency(analysis.estimated_synergies)}</div>
            </div>

            <div className="metric-card highlight">
              <div className="metric-label">ROI</div>
              <div className="metric-value">{analysis.roi_percentage.toFixed(2)}%</div>
            </div>
          </div>

          <div className="equity-distribution">
            <h4>Equity Distribution</h4>
            <div className="equity-bars">
              <div className="equity-bar">
                <div className="equity-label">{analysis.firm_a.firm_name}</div>
                <div className="equity-progress">
                  <div
                    className="equity-fill firm-a"
                    style={{ width: `${analysis.equity_distribution.firm_a_percentage}%` }}
                  >
                    {analysis.equity_distribution.firm_a_percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="equity-bar">
                <div className="equity-label">{analysis.firm_b.firm_name}</div>
                <div className="equity-progress">
                  <div
                    className="equity-fill firm-b"
                    style={{ width: `${analysis.equity_distribution.firm_b_percentage}%` }}
                  >
                    {analysis.equity_distribution.firm_b_percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="firm-details">
            <div className="firm-detail-card">
              <h4>{analysis.firm_a.firm_name}</h4>
              <p>Revenue: {formatCurrency(analysis.firm_a.revenue)}</p>
              <p>Costs: {formatCurrency(analysis.firm_a.costs)}</p>
            </div>
            <div className="firm-detail-card">
              <h4>{analysis.firm_b.firm_name}</h4>
              <p>Revenue: {formatCurrency(analysis.firm_b.revenue)}</p>
              <p>Costs: {formatCurrency(analysis.firm_b.costs)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MergerAnalysis;
