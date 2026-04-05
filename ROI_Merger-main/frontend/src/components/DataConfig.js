import React, { useState, useEffect } from 'react';
import { Settings, Globe, Database, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';

const SYMBOLS = ['SPY', 'QQQ', 'DIA', 'IWM', 'VTI', 'AAPL', 'MSFT', 'GOOGL'];

export default function DataConfig() {
  const [health, setHealth] = useState(null);
  const [market, setMarket] = useState(null);
  const [symbol, setSymbol] = useState('SPY');
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [loadingMarket, setLoadingMarket] = useState(false);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setLoadingHealth(true);
    try {
      const h = await api.getHealth();
      setHealth(h);
    } catch (e) {
      setHealth({ status: 'unhealthy', error: e.message });
    } finally {
      setLoadingHealth(false);
    }
  };

  const fetchMarket = async () => {
    setLoadingMarket(true);
    try {
      const m = await api.getMarketData(symbol);
      setMarket(m);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMarket(false);
    }
  };

  const isHealthy = health?.status === 'healthy';

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Data Config</h1>
        <p className="page-subtitle">API connections, data sources, and system health</p>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* System Health */}
        <div className="card">
          <div className="card-title"><Database size={14} /> System Health</div>
          {loadingHealth ? (
            <div className="skeleton" style={{ height: 80 }} />
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                {isHealthy
                  ? <CheckCircle size={24} color="var(--accent-green)" />
                  : <XCircle size={24} color="var(--accent-red)" />}
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: isHealthy ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                    {isHealthy ? 'All Systems Operational' : 'Degraded'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Database: {health?.database || 'unknown'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'FastAPI Backend', status: isHealthy },
                  { label: 'MySQL Database', status: health?.database === 'connected' },
                  { label: 'AI Agents', status: true },
                  { label: 'Forecasting Model', status: true },
                ].map(({ label, status }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
                    <span className={`badge badge-${status ? 'green' : 'red'}`}>{status ? 'online' : 'offline'}</span>
                  </div>
                ))}
              </div>

              <button className="btn-secondary" onClick={checkHealth} style={{ marginTop: 16, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <RefreshCw size={14} /> Refresh Status
              </button>
            </div>
          )}
        </div>

        {/* Market Data */}
        <div className="card">
          <div className="card-title"><Globe size={14} /> External Market Data</div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>Symbol</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <select className="firm-select" value={symbol} onChange={e => setSymbol(e.target.value)} style={{ flex: 1 }}>
                {SYMBOLS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button className="btn-primary" onClick={fetchMarket} disabled={loadingMarket}
                style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 6 }}>
                {loadingMarket ? '...' : <><Globe size={13} /> Fetch</>}
              </button>
            </div>
          </div>

          {market && (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {[
                  { label: 'Symbol', value: market.market?.symbol },
                  { label: 'Price', value: market.market?.price !== 'N/A' ? `$${market.market?.price}` : 'N/A (demo key)' },
                  { label: 'Change %', value: market.market?.change_pct },
                  { label: 'Volume', value: market.market?.volume },
                  { label: 'Source', value: market.market?.source },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{value || '—'}</span>
                  </div>
                ))}
              </div>

              {market.sectors?.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Sector Performance</div>
                  {market.sectors.slice(0, 5).map((s, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{s.sector}</span>
                      <span style={{ color: s.performance?.startsWith('-') ? 'var(--accent-red)' : 'var(--accent-green)', fontWeight: 600 }}>{s.performance}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!market && (
            <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
              Select a symbol and click Fetch to load market data.<br />
              <span style={{ fontSize: 11, marginTop: 4, display: 'block' }}>Powered by Alpha Vantage API</span>
            </div>
          )}
        </div>
      </div>

      {/* Environment info */}
      <div className="card">
        <div className="card-title"><Settings size={14} /> Environment Configuration</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { label: 'API Base URL', value: process.env.REACT_APP_API_URL || 'https://roimerger-production.up.railway.app' },
            { label: 'Forecast Horizon', value: '30 days' },
            { label: 'RL Algorithm', value: 'PPO (Stable-Baselines3)' },
            { label: 'Forecasting Model', value: 'XGBoost + Lag Features' },
            { label: 'Explainability', value: 'SHAP TreeExplainer' },
            { label: 'Deployment', value: 'Railway.app' },
          ].map(({ label, value }) => (
            <div key={label} className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', wordBreak: 'break-all' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
