import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { TrendingUp, TrendingDown, BarChart2, GitCompare } from 'lucide-react';
import api from '../services/api';

const TICKERS = ['AAPL','ADBE','AMZN','CRM','CSCO','GOOGL','IBM','INTC','META','MSFT','NFLX','NVDA','ORCL','TSLA'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0a1628', border: '1px solid rgba(99,179,237,0.2)', borderRadius: 10, padding: '10px 14px' }}>
      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 13, fontWeight: 600, color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? `${p.value.toFixed(2)}%` : p.value}
        </div>
      ))}
    </div>
  );
};

export default function MarketIntelligence() {
  const [tickers, setTickers] = useState([]);
  const [selectedA, setSelectedA] = useState('AAPL');
  const [selectedB, setSelectedB] = useState('MSFT');
  const [quarterlyA, setQuarterlyA] = useState([]);
  const [compareData, setCompareData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    api.getAvailableTickers().then(d => setTickers(d.tickers || [])).catch(() => {});
    loadTicker('AAPL');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadTicker = async (ticker) => {
    setLoading(true);
    try {
      const data = await api.getStockQuarterly(ticker, 60);
      setQuarterlyA(data.data || []);
      setSelectedA(ticker);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const runCompare = async () => {
    setComparing(true);
    try {
      const data = await api.compareStocks(selectedA, selectedB);
      // Show last 20 quarters
      setCompareData((data.data || []).slice(-20));
    } catch (e) { console.error(e); }
    finally { setComparing(false); }
  };

  // Stats for selected ticker
  const rois = quarterlyA.map(r => parseFloat(r.roi));
  const avgRoi = rois.length ? (rois.reduce((a, b) => a + b, 0) / rois.length).toFixed(2) : 0;
  const maxRoi = rois.length ? Math.max(...rois).toFixed(2) : 0;
  const minRoi = rois.length ? Math.min(...rois).toFixed(2) : 0;
  const latestRoi = rois.length ? rois[rois.length - 1].toFixed(2) : 0;
  const trend = rois.length >= 2 ? rois[rois.length - 1] - rois[rois.length - 2] : 0;

  // Chart data — last 20 quarters
  const chartData = quarterlyA.slice(-20).map(r => ({
    quarter: r.quarter,
    roi: parseFloat(parseFloat(r.roi).toFixed(2)),
  }));

  // Ticker summary cards
  const tickerStats = tickers.map(t => ({
    ...t,
    avg_roi: parseFloat(parseFloat(t.avg_roi || 0).toFixed(2)),
  })).sort((a, b) => b.avg_roi - a.avg_roi);

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Market Intelligence</h1>
        <p className="page-subtitle">Real quarterly ROI from 14 major stocks (2010–2024) — loaded from archive dataset</p>
      </div>

      {/* Ticker grid */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-title"><BarChart2 size={14} /> Select Stock — 14 Real Companies</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {TICKERS.map(t => {
            const stat = tickerStats.find(s => s.ticker === t);
            const isPos = stat && stat.avg_roi > 0;
            return (
              <button key={t} onClick={() => loadTicker(t)}
                style={{
                  padding: '8px 16px', borderRadius: 10, cursor: 'pointer',
                  border: selectedA === t ? '1px solid var(--accent-blue)' : '1px solid var(--border)',
                  background: selectedA === t ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.02)',
                  color: selectedA === t ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600,
                  transition: 'all 0.2s',
                }}>
                {t}
                {stat && (
                  <span style={{ marginLeft: 6, fontSize: 11, color: isPos ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                    {isPos ? '▲' : '▼'}{Math.abs(stat.avg_roi).toFixed(1)}%
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI row for selected ticker */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Latest Quarter ROI', value: `${latestRoi}%`, color: parseFloat(latestRoi) >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' },
          { label: 'Avg Quarterly ROI', value: `${avgRoi}%`, color: 'var(--accent-blue)' },
          { label: 'Best Quarter', value: `${maxRoi}%`, color: 'var(--accent-green)' },
          { label: 'Worst Quarter', value: `${minRoi}%`, color: 'var(--accent-red)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="kpi-card">
            <div className="kpi-label">{label}</div>
            <div className="kpi-value" style={{ fontSize: 26, color }}>{value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{selectedA} · {quarterlyA.length} quarters</div>
          </div>
        ))}
      </div>

      {/* Quarterly ROI chart */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="card-title" style={{ marginBottom: 0 }}>
            <TrendingUp size={14} /> {selectedA} — Quarterly ROI (Last 20 Quarters)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            {trend >= 0
              ? <><TrendingUp size={14} color="var(--accent-green)" /><span style={{ color: 'var(--accent-green)' }}>+{trend.toFixed(2)}% vs prev quarter</span></>
              : <><TrendingDown size={14} color="var(--accent-red)" /><span style={{ color: 'var(--accent-red)' }}>{trend.toFixed(2)}% vs prev quarter</span></>
            }
          </div>
        </div>
        {loading ? (
          <div className="skeleton" style={{ height: 280 }} />
        ) : (
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="roiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="quarter" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} interval={3} />
                <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v.toFixed(0)}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="roi" name={`${selectedA} ROI`} stroke="#3b82f6" fill="url(#roiGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Comparison tool */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-title"><GitCompare size={14} /> Compare Two Stocks — Merger ROI Analysis</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Stock A</label>
            <select className="firm-select" value={selectedA} onChange={e => { setSelectedA(e.target.value); loadTicker(e.target.value); }}>
              {TICKERS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ fontSize: 20, color: 'var(--text-muted)', paddingTop: 20 }}>vs</div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Stock B</label>
            <select className="firm-select" value={selectedB} onChange={e => setSelectedB(e.target.value)}>
              {TICKERS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <button className="btn-primary" onClick={runCompare} disabled={comparing || selectedA === selectedB}
            style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            {comparing ? '⚙️ Comparing...' : <><GitCompare size={14} /> Compare ROI</>}
          </button>
        </div>

        {compareData.length > 0 && (
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={compareData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="quarter" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} interval={3} />
                <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v.toFixed(0)}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                <Line type="monotone" dataKey={selectedA} stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey={selectedB} stroke="#8b5cf6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="combined" name="Combined Avg" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        {compareData.length === 0 && (
          <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: 13 }}>
            Select two stocks and click Compare ROI to see their historical performance side by side
          </div>
        )}
      </div>

      {/* All tickers avg ROI bar */}
      <div className="card">
        <div className="card-title">📊 All 14 Stocks — Average Quarterly ROI (2010–2024)</div>
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tickerStats} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v.toFixed(0)}%`} />
              <YAxis type="category" dataKey="ticker" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} width={50} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="avg_roi" name="Avg ROI %" fill="#3b82f6" radius={[0, 4, 4, 0]}
                background={{ fill: 'rgba(255,255,255,0.02)', radius: [0, 4, 4, 0] }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
