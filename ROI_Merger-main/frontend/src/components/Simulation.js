import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FlaskConical, Zap, ArrowRight, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import api from '../services/api';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0a1628', border: '1px solid rgba(99,179,237,0.2)', borderRadius: 10, padding: '10px 14px' }}>
      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Day {label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 13, fontWeight: 600, color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}%
        </div>
      ))}
    </div>
  );
};

function ActionIcon({ action }) {
  if (action === 'increase') return <ArrowUp size={14} color="var(--accent-green)" />;
  if (action === 'decrease') return <ArrowDown size={14} color="var(--accent-red)" />;
  return <Minus size={14} color="var(--text-muted)" />;
}

export default function Simulation({ firmId }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ran, setRan] = useState(false);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const data = await api.getSimulation(firmId);
      setResult(data);
      setRan(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const chartData = result
    ? result.current_trajectory.map((c, i) => ({
        day: c.day,
        current: parseFloat(c.roi),
        optimized: parseFloat(result.optimized_trajectory[i]?.roi || 0),
      }))
    : [];

  const recs = result?.rl_recommendations?.recommendations || [];

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Simulation Engine</h1>
        <p className="page-subtitle">Compare current strategy vs RL-optimized strategy over 30 days</p>
      </div>

      {!ran && (
        <div className="card" style={{ textAlign: 'center', padding: 60, marginBottom: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>🎮</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Auto-Optimize Simulation</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 480, margin: '0 auto 32px', lineHeight: 1.7 }}>
            Click below to run a 30-day simulation comparing your current capital allocation
            strategy against the PPO reinforcement learning agent's recommendation.
          </p>
          <button className="btn-primary" onClick={runSimulation} disabled={loading}
            style={{ padding: '16px 48px', fontSize: 15, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            {loading ? (
              <>
                <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚙️</span>
                Running AI Simulation...
              </>
            ) : (
              <><Zap size={16} /> Run Auto-Optimize</>
            )}
          </button>
        </div>
      )}

      {result && (
        <>
          {/* Comparison boxes */}
          <div className="sim-comparison" style={{ marginBottom: 24 }}>
            <div className="sim-box current">
              <div className="sim-box-label">Current Strategy</div>
              <div className="sim-box-value">{result.current_final_roi?.toFixed(2)}%</div>
              <div style={{ fontSize: 12, color: '#f87171', marginTop: 6 }}>Final ROI (Day 30)</div>
            </div>
            <div className="sim-box optimized">
              <div className="sim-box-label">RL Optimized</div>
              <div className="sim-box-value">{result.optimized_final_roi?.toFixed(2)}%</div>
              <div style={{ fontSize: 12, color: '#34d399', marginTop: 6 }}>Final ROI (Day 30)</div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 24, textAlign: 'center', padding: 20 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              Projected Improvement
            </div>
            <div style={{ fontSize: 48, fontWeight: 800, color: result.improvement_pct >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', letterSpacing: -2 }}>
              {result.improvement_pct >= 0 ? '+' : ''}{result.improvement_pct?.toFixed(1)}%
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              Method: <span className="badge badge-purple">{result.rl_recommendations?.method || 'PPO'}</span>
            </div>
          </div>

          {/* Trajectory chart */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-title"><FlaskConical size={14} /> 30-Day ROI Trajectory</div>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="day" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: 'Day', position: 'insideBottom', fill: '#475569', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                  <Line type="monotone" dataKey="current" name="Current Strategy" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="optimized" name="RL Optimized" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid-2">
            {/* RL Recommendations */}
            <div className="card">
              <div className="card-title">🤖 RL Recommendations</div>
              <div style={{ marginBottom: 12 }}>
                <div className="insight-box" style={{ marginBottom: 16 }}>
                  {result.rl_recommendations?.summary}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recs.map((r, i) => (
                  <div key={i} className="rec-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <ActionIcon action={r.action} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{r.department}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {r.current_pct}% → {r.recommended_pct}%
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: r.delta_amount >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                        {r.delta_amount >= 0 ? '+' : ''}₹{Math.abs(r.delta_amount).toLocaleString()}
                      </div>
                      <span className={`badge badge-${r.action === 'increase' ? 'green' : r.action === 'decrease' ? 'red' : 'blue'}`}>
                        {r.action}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Decision trace */}
            <div className="card">
              <div className="card-title">📋 Decision Trace</div>
              <div>
                {(result.decision_trace || []).map((t, i) => (
                  <div key={i} className="trace-item">
                    <div className="trace-dot" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
              <button className="btn-primary" onClick={runSimulation} disabled={loading}
                style={{ marginTop: 20, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Zap size={14} /> Re-run Simulation
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
