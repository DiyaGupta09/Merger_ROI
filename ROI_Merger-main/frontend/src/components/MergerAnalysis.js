import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GitMerge, TrendingUp, DollarSign, Zap } from 'lucide-react';
import api from '../services/api';

const fmt = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
const fmtShort = (v) => {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return fmt(v);
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0a1628', border: '1px solid rgba(99,179,237,0.2)', borderRadius: 10, padding: '10px 14px' }}>
      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 13, fontWeight: 600, color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? fmtShort(p.value) : p.value}
        </div>
      ))}
    </div>
  );
};

function RecommendationBadge({ rec }) {
  const config = {
    Proceed: { color: 'var(--accent-green)', badge: 'badge-green', label: '✅ Proceed with Merger' },
    Review: { color: 'var(--accent-amber)', badge: 'badge-amber', label: '⚠️ Review Before Proceeding' },
    Decline: { color: 'var(--accent-red)', badge: 'badge-red', label: '❌ Decline Merger' },
  };
  const c = config[rec] || config['Review'];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px',
      background: `${c.color}10`, border: `1px solid ${c.color}40`, borderRadius: 12
    }}>
      <div style={{ fontSize: 24 }}>{c.label.split(' ')[0]}</div>
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: c.color }}>{c.label}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
          Based on ROI analysis, synergy estimates, and cost projections
        </div>
      </div>
    </div>
  );
}

export default function MergerAnalysis({ firms }) {
  const [firmA, setFirmA] = useState('');
  const [firmB, setFirmB] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ran, setRan] = useState(false);

  const canRun = firmA && firmB && firmA !== firmB;

  const runAnalysis = async () => {
    if (!canRun) return;
    setLoading(true);
    try {
      const data = await api.analyzeMerger(parseInt(firmA), parseInt(firmB));
      setResult(data);
      setRan(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Comparison bar chart data
  const comparisonData = result ? [
    {
      name: result.firm_a?.firm_name || 'Firm A',
      revenue: result.firm_a?.revenue || 0,
      costs: result.firm_a?.costs || 0,
      roi: parseFloat(((result.firm_a?.revenue - result.firm_a?.costs) / Math.max(result.firm_a?.costs, 1) * 100).toFixed(1)),
    },
    {
      name: result.firm_b?.firm_name || 'Firm B',
      revenue: result.firm_b?.revenue || 0,
      costs: result.firm_b?.costs || 0,
      roi: parseFloat(((result.firm_b?.revenue - result.firm_b?.costs) / Math.max(result.firm_b?.costs, 1) * 100).toFixed(1)),
    },
    {
      name: 'Combined',
      revenue: result.combined_revenue || 0,
      costs: (result.combined_costs || 0) - (result.estimated_synergies || 0),
      roi: parseFloat((result.roi_percentage || 0).toFixed(1)),
    },
  ] : [];

  const equityA = result?.equity_distribution?.firm_a_percentage || 50;
  const equityB = result?.equity_distribution?.firm_b_percentage || 50;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Merger Analysis</h1>
        <p className="page-subtitle">Simulate what happens when two companies merge — ROI, synergies, equity split</p>
      </div>

      {/* Firm selector */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-title"><GitMerge size={14} /> Select Companies to Merge</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto', gap: 16, alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>Company A</label>
            <select className="firm-select" style={{ width: '100%' }} value={firmA} onChange={e => setFirmA(e.target.value)}>
              <option value="">Select company...</option>
              {(firms || []).map(f => (
                <option key={f.firm_id} value={f.firm_id}>{f.firm_name}</option>
              ))}
            </select>
          </div>

          <div style={{ textAlign: 'center', paddingBottom: 8 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'var(--gradient-accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, margin: '0 auto'
            }}>+</div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>Company B</label>
            <select className="firm-select" style={{ width: '100%' }} value={firmB} onChange={e => setFirmB(e.target.value)}>
              <option value="">Select company...</option>
              {(firms || []).map(f => (
                <option key={f.firm_id} value={f.firm_id}>{f.firm_name}</option>
              ))}
            </select>
          </div>

          <button className="btn-primary" onClick={runAnalysis}
            disabled={!canRun || loading}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px' }}>
            {loading
              ? <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚙️</span> Analyzing...</>
              : <><Zap size={15} /> Analyze Merger</>
            }
          </button>
        </div>
        {firmA && firmB && firmA === firmB && (
          <div style={{ marginTop: 12, fontSize: 13, color: 'var(--accent-red)' }}>
            Please select two different companies.
          </div>
        )}
      </div>

      {result && (
        <>
          {/* Recommendation */}
          <div style={{ marginBottom: 24 }}>
            <RecommendationBadge rec={result.recommendation} />
          </div>

          {/* KPI cards */}
          <div className="grid-4" style={{ marginBottom: 24 }}>
            {[
              { label: 'Combined Revenue', value: fmtShort(result.combined_revenue), icon: DollarSign, color: 'var(--accent-blue)' },
              { label: 'Merger ROI', value: `${parseFloat(result.roi_percentage || 0).toFixed(1)}%`, icon: TrendingUp, color: 'var(--accent-green)' },
              { label: 'Cost Synergies', value: fmtShort(result.estimated_synergies), icon: Zap, color: 'var(--accent-purple)' },
              { label: 'Net Benefit', value: fmtShort(result.net_benefit), icon: TrendingUp, color: 'var(--accent-cyan)' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="kpi-card">
                <div className="kpi-icon" style={{ background: `${color}20` }}><Icon size={18} color={color} /></div>
                <div className="kpi-label">{label}</div>
                <div className="kpi-value" style={{ fontSize: 24 }}>{value}</div>
              </div>
            ))}
          </div>

          <div className="grid-2" style={{ marginBottom: 24 }}>
            {/* Revenue + Cost comparison */}
            <div className="card">
              <div className="card-title">📊 Revenue vs Costs Comparison</div>
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false}
                      tickFormatter={v => fmtShort(v)} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="costs" name="Costs (post-synergy)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Equity split */}
            <div className="card">
              <div className="card-title">⚖️ Equity Distribution</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 16 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{result.firm_a?.firm_name}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#3b82f6' }}>{equityA.toFixed(1)}%</span>
                  </div>
                  <div style={{ height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 5, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${equityA}%`, background: '#3b82f6', borderRadius: 5, transition: 'width 1s ease' }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{result.firm_b?.firm_name}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#8b5cf6' }}>{equityB.toFixed(1)}%</span>
                  </div>
                  <div style={{ height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 5, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${equityB}%`, background: '#8b5cf6', borderRadius: 5, transition: 'width 1s ease' }} />
                  </div>
                </div>

                <div className="divider" />

                {/* Side by side individual ROIs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { firm: result.firm_a, color: '#3b82f6' },
                    { firm: result.firm_b, color: '#8b5cf6' },
                  ].map(({ firm, color }) => {
                    const roi = ((firm.revenue - firm.costs) / Math.max(firm.costs, 1) * 100).toFixed(1);
                    return (
                      <div key={firm.firm_id} style={{ padding: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{firm.firm_name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Revenue: <span style={{ color: 'var(--text-primary)' }}>{fmtShort(firm.revenue)}</span></div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Costs: <span style={{ color: 'var(--text-primary)' }}>{fmtShort(firm.costs)}</span></div>
                        <div style={{ fontSize: 16, fontWeight: 700, color, marginTop: 8 }}>{roi}% ROI</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Merger details breakdown */}
          <div className="card">
            <div className="card-title">🔍 Merger Financial Breakdown</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[
                { label: 'Combined Revenue', value: fmtShort(result.combined_revenue), desc: 'Total revenue post-merger' },
                { label: 'Combined Costs', value: fmtShort(result.combined_costs), desc: 'Before synergy savings' },
                { label: 'Synergy Savings', value: fmtShort(result.estimated_synergies), desc: '10% cost reduction from scale' },
                { label: 'Merger Cost', value: fmtShort(result.merger_cost), desc: '5% of combined costs' },
                { label: 'Net Benefit', value: fmtShort(result.net_benefit), desc: 'Revenue minus adjusted costs' },
                { label: 'Merger ROI', value: `${parseFloat(result.roi_percentage).toFixed(1)}%`, desc: 'Return on merger investment' },
              ].map(({ label, value, desc }) => (
                <div key={label} style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {!ran && (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🤝</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
            Select two companies above to simulate a merger
          </div>
          <div style={{ fontSize: 13 }}>
            See combined ROI, cost synergies, equity split, and AI recommendation
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
