import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Brain, Lightbulb, TrendingUp, RefreshCw } from 'lucide-react';
import api from '../services/api';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0a1628', border: '1px solid rgba(99,179,237,0.2)', borderRadius: 10, padding: '10px 14px' }}>
      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 13, fontWeight: 600, color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
        </div>
      ))}
    </div>
  );
};

function FeatureBar({ feature, value, max }) {
  const pct = Math.min(Math.abs(value) / (max || 1) * 100, 100);
  const isPos = value >= 0;
  return (
    <div className="feature-bar-row">
      <div className="feature-bar-label">{feature.replace(/_/g, ' ')}</div>
      <div className="feature-bar-track">
        <div className="feature-bar-fill" style={{
          width: `${pct}%`,
          background: isPos ? 'var(--accent-green)' : 'var(--accent-red)',
        }} />
      </div>
      <div className="feature-bar-value" style={{ color: isPos ? 'var(--accent-green)' : 'var(--accent-red)' }}>
        {value > 0 ? '+' : ''}{value.toFixed(3)}
      </div>
    </div>
  );
}

export default function AIInsights({ firmId }) {
  const [forecast, setForecast] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { load(); }, [firmId]);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const [fc, ex] = await Promise.all([
        api.getForecast(firmId),
        api.getExplanation(firmId),
      ]);
      setForecast(fc);
      setExplanation(ex);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div className="skeleton" style={{ height: 32, width: 220, marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 16, width: 340 }} />
        </div>
        <div className="grid-2" style={{ marginBottom: 24 }}>
          <div className="skeleton" style={{ height: 320 }} />
          <div className="skeleton" style={{ height: 320 }} />
        </div>
      </div>
    );
  }

  const predictions = forecast?.predictions || [];
  const today = new Date().toISOString().slice(0, 10);
  const chartData = predictions.map(p => ({
    date: p.date.slice(5),
    forecast: parseFloat(p.value),
    upper: parseFloat(p.upper),
    lower: parseFloat(p.lower),
  }));

  const features = explanation?.feature_importance || [];
  const maxShap = Math.max(...features.map(f => Math.abs(f.shap_value)), 0.001);

  return (
    <div className="fade-in">
      <div className="topbar">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1 className="page-title">AI Insights</h1>
          <p className="page-subtitle">Forecast + explainability for Firm {firmId}</p>
        </div>
        <button className="btn-secondary" onClick={() => load(true)} disabled={refreshing}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Forecast chart */}
        <div className="card">
          <div className="card-title"><TrendingUp size={14} /> 30-Day ROI Forecast</div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ciGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="upper" name="Upper CI" stroke="transparent" fill="url(#ciGrad)" strokeWidth={0} />
                <Area type="monotone" dataKey="lower" name="Lower CI" stroke="transparent" fill="url(#ciGrad)" strokeWidth={0} />
                <Area type="monotone" dataKey="forecast" name="Forecast ROI" stroke="#3b82f6" fill="url(#forecastGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 12, height: 2, background: '#3b82f6', display: 'inline-block', borderRadius: 1 }} />
              Forecast
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 12, height: 8, background: 'rgba(139,92,246,0.2)', display: 'inline-block', borderRadius: 2 }} />
              95% Confidence Interval
            </span>
          </div>
        </div>

        {/* SHAP feature importance */}
        <div className="card">
          <div className="card-title"><Brain size={14} /> Feature Importance (SHAP)</div>
          <div className="feature-bar-container" style={{ marginBottom: 20 }}>
            {features.slice(0, 7).map((f, i) => (
              <FeatureBar key={i} feature={f.feature} value={f.shap_value} max={maxShap} />
            ))}
          </div>
          {features.length === 0 && (
            <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Training model... run /api/explain first.</div>
          )}
        </div>
      </div>

      {/* Narrative */}
      <div className="card">
        <div className="card-title"><Lightbulb size={14} /> AI Narrative</div>
        <div className="insight-box">
          {explanation?.narrative || 'Loading AI narrative...'}
        </div>
        {predictions.length > 0 && (
          <div style={{ marginTop: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div className="card" style={{ flex: 1, minWidth: 140, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>Day 1 Forecast</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent-blue)' }}>{predictions[0]?.value?.toFixed(2)}%</div>
            </div>
            <div className="card" style={{ flex: 1, minWidth: 140, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>Day 30 Forecast</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent-purple)' }}>{predictions[predictions.length - 1]?.value?.toFixed(2)}%</div>
            </div>
            <div className="card" style={{ flex: 1, minWidth: 140, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>Trend</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: predictions[predictions.length - 1]?.value > predictions[0]?.value ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {predictions[predictions.length - 1]?.value > predictions[0]?.value ? '↑ Up' : '↓ Down'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
