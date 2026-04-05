import React from 'react';
import { LayoutDashboard, Brain, FlaskConical, Settings, Zap, GitMerge, BarChart2 } from 'lucide-react';

const NAV = [
  { id: 'landing', label: 'Home', icon: Zap },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'merger', label: 'Merger Analysis', icon: GitMerge },
  { id: 'market', label: 'Market Intel', icon: BarChart2 },
  { id: 'insights', label: 'AI Insights', icon: Brain },
  { id: 'simulation', label: 'Simulation', icon: FlaskConical },
  { id: 'config', label: 'Data Config', icon: Settings },
];

export default function Sidebar({ active, onNavigate, apiStatus }) {
  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">⚡</div>
        <div>
          <div className="sidebar-logo-text">CapitalAI</div>
          <div className="sidebar-logo-sub">Decision Intelligence</div>
        </div>
      </div>

      <div className="nav-section-label">Navigation</div>

      {NAV.map(({ id, label, icon: Icon }) => (
        <div
          key={id}
          className={`nav-item ${active === id ? 'active' : ''}`}
          onClick={() => onNavigate(id)}
        >
          <Icon size={16} className="nav-item-icon" />
          {label}
        </div>
      ))}

      <div className="sidebar-footer">
        <div className="status-indicator">
          <div className={`pulse-dot`} style={{
            background: apiStatus === 'healthy' ? 'var(--accent-green)' : 'var(--accent-amber)',
            boxShadow: apiStatus === 'healthy'
              ? '0 0 0 0 rgba(16,185,129,0.4)'
              : '0 0 0 0 rgba(245,158,11,0.4)',
          }} />
          <span>API {apiStatus === 'healthy' ? 'Connected' : 'Connecting...'}</span>
        </div>
      </div>
    </nav>
  );
}
