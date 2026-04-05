import React from 'react';

const FEATURES = [
  {
    icon: '📈',
    color: 'rgba(59,130,246,0.15)',
    title: 'ROI Forecasting',
    desc: 'XGBoost-powered time-series model predicts your ROI 30 days ahead with confidence intervals and key driver analysis.',
  },
  {
    icon: '🧠',
    color: 'rgba(139,92,246,0.15)',
    title: 'SHAP Explainability',
    desc: 'Understand exactly why ROI is rising or falling. Feature-level SHAP values translated into plain-language narratives.',
  },
  {
    icon: '🤖',
    color: 'rgba(16,185,129,0.15)',
    title: 'RL Capital Optimizer',
    desc: 'PPO reinforcement learning agent recommends optimal capital allocation across departments to maximize 30-day ROI.',
  },
  {
    icon: '🎮',
    color: 'rgba(245,158,11,0.15)',
    title: 'What-If Simulation',
    desc: 'Compare current strategy vs AI-optimized strategy side-by-side. See projected ROI improvement before committing.',
  },
  {
    icon: '🌐',
    color: 'rgba(6,182,212,0.15)',
    title: 'Live Market Data',
    desc: 'Alpha Vantage integration enriches predictions with real-time market trends and sector performance signals.',
  },
  {
    icon: '⚡',
    color: 'rgba(239,68,68,0.15)',
    title: 'Autonomous Agents',
    desc: 'Modular AI agent architecture: Data → Forecast → Explain → Optimize → Simulate. Each agent is independently upgradeable.',
  },
];

export default function Landing({ onNavigate }) {
  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content fade-in">
          <div className="hero-badge">
            <span>⚡</span>
            <span>AI-Powered · Autonomous · Real-Time</span>
          </div>

          <h1 className="hero-title">
            <span className="gradient-text">Financial Decision</span>
            <br />
            Intelligence Platform
          </h1>

          <p className="hero-subtitle">
            Not just a dashboard. An autonomous AI system that predicts ROI,
            explains decisions, and recommends optimal capital allocation using
            reinforcement learning.
          </p>

          <div className="hero-actions">
            <button className="btn-primary" onClick={() => onNavigate('dashboard')}
              style={{ padding: '14px 32px', fontSize: '15px' }}>
              Launch Dashboard →
            </button>
            <button className="btn-secondary" onClick={() => onNavigate('simulation')}
              style={{ padding: '14px 32px', fontSize: '15px' }}>
              Try Simulation
            </button>
          </div>

          <div style={{ marginTop: 60, display: 'flex', gap: 40, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { label: 'Prediction Horizon', value: '30 Days' },
              { label: 'AI Agents', value: '5 Active' },
              { label: 'Data Sources', value: 'MySQL + APIs' },
            ].map(({ label, value }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: -1 }}>{value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: 'rgba(255,255,255,0.01)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
            The Story
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.5, marginBottom: 16 }}>
            Before vs After
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 24, alignItems: 'center', maxWidth: 700, margin: '0 auto' }}>
            <div className="card" style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent-red)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Before</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>Static dashboard. You look at numbers and guess what to do next.</div>
            </div>
            <div style={{ fontSize: 28 }}>→</div>
            <div className="card" style={{ textAlign: 'left', borderColor: 'rgba(59,130,246,0.3)' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent-green)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>After</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>AI agent that predicts, explains, and acts autonomously on your behalf.</div>
            </div>
          </div>
        </div>
      </section>

      <div className="features-grid">
        {FEATURES.map(({ icon, color, title, desc }) => (
          <div key={title} className="feature-card">
            <div className="feature-icon" style={{ background: color }}>{icon}</div>
            <div className="feature-title">{title}</div>
            <div className="feature-desc">{desc}</div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', padding: '40px 24px 80px', borderTop: '1px solid var(--border)' }}>
        <button className="btn-primary" onClick={() => onNavigate('dashboard')}
          style={{ padding: '16px 48px', fontSize: '16px' }}>
          Get Started →
        </button>
      </div>
    </div>
  );
}
