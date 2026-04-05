import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GitMerge, TrendingUp, DollarSign, Zap, Brain } from 'lucide-react';
import api from '../services/api';

const fmt = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
const fmtShort = (v) => {
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return fmt(v);
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0a1628', border: '1px solid rgba(99,179,237,0.2)', borderRadius: 10, padding: '10px 14px' }}>
      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 13, fontWeight: 600, color: p.color }}>
          {p.name}: {typeof p.value === 'number'
            ? p.dataKey === 'roi' ? `${p.value.toFixed(1)}%` : fmtShort(p.value)
            : p.value}
        </div>
      ))}
    </div>
  );
};

function RecommendationBadge({ rec }) {
  const config = {
    Proceed:  { emoji: '✅', color: 'var(--accent-green)',  label: 'Proceed with Merger' },
    Review:   { emoji: '⚠️', color: 'var(--accent-amber)',  label: 'Review Before Proceeding' },
    Decline:  { emoji: '❌', color: 'var(--accent-red)',    label: 'Decline Merger' },
  };
  const c = config[rec] || config['Review'];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '18px 24px',
      background: `${c.color}10`, border: `1px solid ${c.color}40`, borderRadius: 14,
    }}>
      <span style={{ fontSize: 28 }}>{c.emoji}</span>
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, color: c.color }}>{c.label}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
          AI-predicted post-merger ROI analysis · XGBoost Forecasting Agent
        </div>
      </div>
    </div>
  );
}

function ConfidenceBar({ value }) {
  const color = value >= 70 ? 'var(--accent-green)' : value >= 50 ? 'var(--accent-amber)' : 'var(--accent-red)';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>AI Confidence</span>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{value?.toFixed(1)}%</span>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 3, transition: 'width 1s ease' }} />
      </div>
    </div>
  );
}

export default function MergerAnalysis({ firms }) {
  const [firmA, setFirmA] = useState('');
  const [firmB, setFirmB] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const canRun = firmA && firmB && firmA !== firmB;

  const runAnalysis = async () => {
    if (!canRun) return;
    setLoading(true);
    try {
      const data = await api.analyzeMerger(parseInt(firmA), parseInt(firmB));
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const comparisonData = result ? [
    { name: result.firm_a?.firm_name?.split(' ')[0], revenue: result.firm_a?.revenue, costs: result.firm_a?.costs, roi: result.firm_a?.roi_percentage },
    { name: result.firm_b?.firm_name?.split(' ')[0], revenue: result.firm_b?.revenue, costs: result.firm_b?.costs, roi: result.firm_b?.roi_percentage },
    { name: 'Combined', revenue: result.combined_revenue, costs: result.adjusted_costs, roi: result.roi_percentage },
  ] : [];

  const equityA = result?.equity_distribution?.firm_a_percentage || 50;
  const equityB = result?.equity_distribution?.firm_b_percentage || 50;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Merger Analysis</h1>
        <p className="page-subtitle">AI predicts post-merger ROI using XGBoost on historical data — not just formulas</p>
      </div>

      {/* Selector */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-title"><GitMerge size={14} /> Select Companies to Merge</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr auto', gap: 16, alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>Company A</label>
            <select className="firm-select" style={{ width: '100%' }} value={firmA} onChange={e => setFirmA(e.target.value)}>
              <option value="">Select company...</option>
              {(firms || []).map(f => <option key={f.firm_id} value={f.firm_id}>{f.firm_name}</option>)}
            </select>
          </div>
          <div style={{ textAlign: 'center', paddingBottom: 8, fontSize: 22, color: 'var(--text-muted)' }}>+</div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>Company B</label>
            <select className="firm-select" style={{ width: '100%' }} value={firmB} onChange={e => setFirmB(e.target.value)}>
              <option value="">Select company...</option>
              {(firms || []).map(f => <option key={f.firm_id} value={f.firm_id}>{f.firm_name}</option>)}
            </select>
          </div>
          <button className="btn-primary" onClick={runAnalysis} disabled={!canRun || loading}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px' }}>
            {loading
              ? <><span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⚙️</span> Predicting...</>
              : <><Brain size={15} /> AI Analyze</>}
          </button>
        </div>
        {firmA && firmB && firmA === firmB && (
          <div style={{ marginTop: 10, fontSize: 13, color: 'var(--accent-red)' }}>Select two different companies.</div>
        )}
      </div>

      {result && (
        <>
          <div style={{ marginBottom: 24 }}><RecommendationBadge rec={result.recommendation} /></div>

          {/* KPIs */}
          <div className="grid-4" style={{ marginBottom: 24 }}>
            {[
              { label: 'AI Predicted ROI', value: `${result.roi_percentage?.toFixed(1)}%`, icon: Brain, color: 'var(--accent-purple)', sub: `Formula baseline: ${result.formula_roi?.toFixed(1)}%` },
              { label: 'Combined Revenue', value: fmtShort(result.combined_revenue), icon: DollarSign, color: 'var(--accent-blue)', sub: `${result.firm_a?.firm_name?.split(' ')[0]} + ${result.firm_b?.firm_name?.split(' ')[0]}` },
              { label: 'Cost Synergies', value: fmtShort(result.estimated_synergies), icon: Zap, color: 'var(--accent-green)', sub: `${(result.synergy_rate * 100).toFixed(0)}% savings${result.same_industry ? ' (same industry)' : ''}` },
              { label: 'Net Benefit', value: fmtShort(result.net_benefit), icon: TrendingUp, color: 'var(--accent-cyan)', sub: `After synergy adjustments` },
            ].map(({ label, value, icon: Icon, color, sub }) => (
              <div key={label} className="kpi-card">
                <div className="kpi-icon" style={{ background: `${color}20` }}><Icon size={18} color={color} /></div>
                <div className="kpi-label">{label}</div>
                <div className="kpi-value" style={{ fontSize: 22 }}>{value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>
              </div>
            ))}
          </div>

          <div className="grid-2" style={{ marginBottom: 24 }}>
            {/* Revenue + ROI comparison chart */}
            <div className="card">
              <div className="card-title">📊 Revenue & ROI — Individual vs Combined</div>
              <div style={{ height: 240, marginBottom: 16 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => fmtShort(v)} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[4,4,0,0]} />
                    <Bar yAxisId="left" dataKey="costs" name="Costs" fill="#8b5cf6" radius={[4,4,0,0]} />
                    <Bar yAxisId="right" dataKey="roi" name="ROI %" fill="#10b981" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* AI confidence */}
              <ConfidenceBar value={result.ai_confidence} />
            </div>

            {/* Equity + AI drivers */}
            <div className="card">
              <div className="card-title">⚖️ Equity Split & AI Drivers</div>

              <div style={{ marginBottom: 20 }}>
                {[
                  { name: result.firm_a?.firm_name, pct: equityA, color: '#3b82f6' },
                  { name: result.firm_b?.firm_name, pct: equityB, color: '#8b5cf6' },
                ].map(({ name, pct, color }) => (
                  <div key={name} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{name}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color }}>{pct}%</span>
                    </div>
                    <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 1s ease' }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="divider" />

              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Brain size={12} /> AI Key Drivers
                </div>
                {(result.ai_drivers || []).map((d, i) => (
                  <div key={i} className="trace-item">
                    <div className="trace-dot" style={{ background: '#8b5cf6' }} />
                    <span style={{ fontSize: 12 }}>{d}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 16, padding: 12, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 10 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Prediction Method</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#a78bfa' }}>{result.prediction_method}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  Trained on combined historical ROI series of both firms
                </div>
              </div>
            </div>
          </div>

          {/* Full breakdown */}
          <div className="card">
            <div className="card-title">🔍 Full Merger Breakdown</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { label: 'Firm A Revenue', value: fmtShort(result.firm_a?.revenue), sub: result.firm_a?.firm_name },
                { label: 'Firm B Revenue', value: fmtShort(result.firm_b?.revenue), sub: result.firm_b?.firm_name },
                { label: 'Combined Revenue', value: fmtShort(result.combined_revenue), sub: 'Post-merger total' },
                { label: 'Firm A ROI', value: `${result.firm_a?.roi_percentage?.toFixed(1)}%`, sub: 'Current standalone' },
                { label: 'Firm B ROI', value: `${result.firm_b?.roi_percentage?.toFixed(1)}%`, sub: 'Current standalone' },
                { label: 'AI Predicted ROI', value: `${result.roi_percentage?.toFixed(1)}%`, sub: 'Post-merger (ML)' },
                { label: 'Combined Costs', value: fmtShort(result.combined_costs), sub: 'Before synergies' },
                { label: 'Synergy Savings', value: fmtShort(result.estimated_synergies), sub: `${(result.synergy_rate*100).toFixed(0)}% cost reduction` },
                { label: 'Combined Staff', value: result.combined_staff, sub: `${result.firm_a?.staff_count} + ${result.firm_b?.staff_count}` },
              ].map(({ label, value, sub }) => (
                <div key={label} style={{ padding: 14, background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {!result && (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🤝</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
            Select two companies to run AI merger analysis
          </div>
          <div style={{ fontSize: 13, maxWidth: 400, margin: '0 auto', lineHeight: 1.7 }}>
            The AI agent combines both firms' historical ROI series and uses XGBoost
            to predict post-merger ROI — not just a formula.
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
