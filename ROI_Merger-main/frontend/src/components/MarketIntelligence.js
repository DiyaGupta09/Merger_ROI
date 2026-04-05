import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Globe, Search, RefreshCw } from 'lucide-react';
import api from '../services/api';

const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Retail', 'Energy', 'Logistics', 'Education', 'Media'];
const POPULAR = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'JPM', 'JNJ', 'WMT', 'XOM', 'NFLX'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0a1628', border: '1px solid rgba(99,179,237,0.2)', borderRadius: 10, padding: '10px 14px' }}>
      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 13, fontWeight: 600, color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? `${p.value.toFixed(1)}%` : p.value}
        </div>
      ))}
    </div>
  );
};

function FlagBadge({ flag }) {
  const colors = { green: 'badge-green', red: 'badge-red', amber: 'badge-amber', unknown: 'badge-blue' };
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
      <div>
        <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{flag.metric}</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>{flag.note}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{flag.value}</span>
        <span className={`badge ${colors[flag.type] || 'badge-blue'}`}>{flag.type}</span>
      </div>
    </div>
  );
}

function StockCard({ stock, onClick }) {
  const isGreen = stock.overall === 'green';
  return (
    <div className="card" style={{ cursor: 'pointer', transition: 'all 0.2s' }}
      onClick={() => onClick(stock.ticker)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{stock.ticker}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{stock.name}</div>
        </div>
        <span className={`badge badge-${isGreen ? 'green' : 'red'}`}>
          {isGreen ? '▲ Bullish' : '▼ Bearish'}
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[
          { label: 'ROI', value: `${stock.roi?.toFixed(1)}%`, pos: stock.roi > 10 },
          { label: 'Rev Growth', value: `${stock.revenue_growth?.toFixed(1)}%`, pos: stock.revenue_growth > 5 },
          { label: 'Margin', value: `${stock.profit_margin?.toFixed(1)}%`, pos: stock.profit_margin > 10 },
          { label: 'P/E', value: stock.pe_ratio?.toFixed(1), pos: stock.pe_ratio > 10 && stock.pe_ratio < 30 },
        ].map(({ label, value, pos }) => (
          <div key={label} style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: pos ? 'var(--accent-green)' : 'var(--accent-red)' }}>{value}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 10, fontSize: 12, color: stock.change_pct >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: 4 }}>
        {stock.change_pct >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {stock.change_pct >= 0 ? '+' : ''}{stock.change_pct?.toFixed(2)}% today · ${stock.price}
      </div>
    </div>
  );
}

export default function MarketIntelligence({ firmId }) {
  const [industry, setIndustry] = useState('Technology');
  const [screener, setScreener] = useState([]);
  const [selected, setSelected] = useState(null);
  const [quarterly, setQuarterly] = useState([]);
  const [benchmark, setBenchmark] = useState(null);
  const [ticker, setTicker] = useState('AAPL');
  const [loading, setLoading] = useState(false);
  const [loadingBench, setLoadingBench] = useState(false);

  useEffect(() => { loadScreener(); }, [industry]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { loadBenchmark(); }, [firmId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadScreener = async () => {
    setLoading(true);
    try {
      const data = await api.getScreener(industry);
      setScreener(data.stocks || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadBenchmark = async () => {
    setLoadingBench(true);
    try {
      const data = await api.getBenchmark(firmId);
      setBenchmark(data);
    } catch (e) { console.error(e); }
    finally { setLoadingBench(false); }
  };

  const loadStock = async (t) => {
    setSelected(null);
    setQuarterly([]);
    try {
      const [fund, qroi] = await Promise.all([
        api.getFundamentals(t),
        api.getQuarterlyROI(t, 4),
      ]);
      setSelected(fund);
      setQuarterly(qroi.quarterly_roi || []);
      setTicker(t);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Market Intelligence</h1>
        <p className="page-subtitle">Real quarterly ROI, red/green flags, and sector benchmarks via Financial Modeling Prep</p>
      </div>

      {/* Benchmark vs internal firm */}
      {benchmark && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-title"><Globe size={14} /> Your Firm vs {benchmark.industry} Market</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div style={{ textAlign: 'center', padding: 16, background: 'rgba(59,130,246,0.06)', borderRadius: 12, border: '1px solid rgba(59,130,246,0.2)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Your Firm ROI</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent-blue)' }}>{benchmark.internal_roi?.toFixed(1)}%</div>
            </div>
            <div style={{ textAlign: 'center', padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Market Avg ROI</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>{benchmark.avg_market_roi?.toFixed(1)}%</div>
            </div>
            <div style={{ textAlign: 'center', padding: 16, background: benchmark.delta >= 0 ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)', borderRadius: 12, border: `1px solid ${benchmark.delta >= 0 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Delta</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: benchmark.delta >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {benchmark.delta >= 0 ? '+' : ''}{benchmark.delta?.toFixed(1)}%
              </div>
            </div>
          </div>
          <div className="insight-box">{benchmark.insight}</div>
        </div>
      )}

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Industry screener */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="card-title" style={{ marginBottom: 0 }}><Search size={14} /> Industry Screener</div>
            <select className="firm-select" value={industry} onChange={e => setIndustry(e.target.value)}>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 100 }} />)}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {screener.map(s => <StockCard key={s.ticker} stock={s} onClick={loadStock} />)}
              {screener.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No data available.</div>}
            </div>
          )}
        </div>

        {/* Stock detail */}
        <div>
          {/* Quick search */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-title" style={{ marginBottom: 12 }}><Search size={14} /> Quick Lookup</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              {POPULAR.map(t => (
                <button key={t} onClick={() => loadStock(t)}
                  className={ticker === t ? 'btn-primary' : 'btn-secondary'}
                  style={{ padding: '6px 14px', fontSize: 12 }}>{t}</button>
              ))}
            </div>
          </div>

          {selected && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{selected.ticker}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{selected.name}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>${selected.price}</div>
                  <div style={{ fontSize: 13, color: selected.change_pct >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                    {selected.change_pct >= 0 ? '+' : ''}{selected.change_pct?.toFixed(2)}%
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                {(selected.flags || []).map((f, i) => <FlagBadge key={i} flag={f} />)}
              </div>

              {quarterly.length > 0 && (
                <>
                  <div className="card-title" style={{ marginTop: 16 }}><TrendingUp size={14} /> Quarterly ROI</div>
                  <div style={{ height: 180 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={quarterly}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="period" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v.toFixed(0)}%`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="roi" name="ROI %" fill="#3b82f6" radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </div>
          )}

          {!selected && (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Click a stock card or quick lookup button to see detailed flags and quarterly ROI</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
