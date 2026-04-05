import React, { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Landing from './components/Landing';
import Dashboard from './components/Dashboard';
import AIInsights from './components/AIInsights';
import Simulation from './components/Simulation';
import DataConfig from './components/DataConfig';
import MergerAnalysis from './components/MergerAnalysis';
import MarketIntelligence from './components/MarketIntelligence';
import api from './services/api';

export default function App() {
  const [page, setPage] = useState('landing');
  const [firmId, setFirmId] = useState(1);
  const [firms, setFirms] = useState([]);
  const [apiStatus, setApiStatus] = useState('connecting');

  useEffect(() => {
    api.getHealth()
      .then(h => setApiStatus(h.status === 'healthy' ? 'healthy' : 'degraded'))
      .catch(() => setApiStatus('degraded'));

    api.getFirms(20)
      .then(d => setFirms(d.firms || []))
      .catch(() => {});
  }, []);

  const isLanding = page === 'landing';

  return (
    <div className="app">
      {!isLanding && (
        <Sidebar active={page} onNavigate={setPage} apiStatus={apiStatus} />
      )}

      <div className={isLanding ? '' : 'main-content'}>
        {!isLanding && page !== 'config' && page !== 'merger' && page !== 'market' && (
          <div className="topbar" style={{ marginBottom: 0 }}>
            <div />
            <div className="topbar-right">
              <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Firm:</label>
              <select
                className="firm-select"
                value={firmId}
                onChange={e => setFirmId(Number(e.target.value))}
              >
                {firms.length > 0
                  ? firms.map(f => (
                      <option key={f.firm_id} value={f.firm_id}>{f.firm_name}</option>
                    ))
                  : <option value={1}>Firm 1</option>
                }
              </select>
            </div>
          </div>
        )}

        {page === 'landing' && <Landing onNavigate={setPage} />}
        {page === 'dashboard' && <Dashboard firmId={firmId} />}
        {page === 'merger' && <MergerAnalysis firms={firms} />}
        {page === 'market' && <MarketIntelligence firmId={firmId} />}
        {page === 'insights' && <AIInsights firmId={firmId} />}
        {page === 'simulation' && <Simulation firmId={firmId} />}
        {page === 'config' && <DataConfig />}
      </div>
    </div>
  );
}
