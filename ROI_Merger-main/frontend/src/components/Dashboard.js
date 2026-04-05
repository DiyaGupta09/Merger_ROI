import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, Building2, Activity } from 'lucide-react';
import api from '../services/api';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0a1628', border: '1px solid rgba(99,179,237,0.2)', borderRadius: 10, padding: '10px 14px' }}>
      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 13, fontWeight: 600, color: p.color }}>{p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</div>
      ))}
    </div>
  );
};

function KPICard({ label, value, change, icon: Icon, color }) {
  const isPos = change >= 0;
  return (
    <div className="kpi-card fade-in">
      <div className="kpi-icon" style={{ background: `${color}20` }}>
        <Icon size={18} color={color} />
      </div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {change !== undefined && (
        <div className={`kpi-change ${isPos ? 'positive' : 'negative'}`}>
          {isPos ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {Math.abs(change).toFixed(1)}% vs last period
        </div>
      )}
    </div>
  );
}

export default function Dashboard({ firmId }) {
  const [summary, setSummary] = useState(null);
  const [roiData, setRoiData] = useState([]);
  const [bottlenecks, setBottlenecks] = useState([]);
  const [timeseries, setTimeseries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [firmId]);

  const load = async () => {
    setLoading(true);
    try {
      const [sum, roi, bn, ts] = await Promise.all([
        api.getDashboardSummary(),
        api.getROI(),
        api.getBottlenecks(),
        api.getTimeseries(firmId),
      ]);
      setSummary(sum);
      setRoiData((roi.roi_metrics || []).slice(0, 10));
      setBottlenecks(bn.bottlenecks || []);
      setTimeseries(ts.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div className="skeleton" style={{ height: 32, width: 200, marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 16, width: 300 }} />
        </div>
        <div className="grid-4" style={{ marginBottom: 24 }}>
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 120 }} />)}
        </div>
      </div>
    );
  }

  const tsChartData = timeseries.map(r => ({
    date: r.timestamp ? String(r.timestamp).slice(0, 7) : '',
    roi: parseFloat(r.roi || 0).toFixed(2),
    cashFlow: parseFloat(r.cash_flow || 0),
  }));

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Executive Dashboard</h1>
        <p className="page-subtitle">Real-time financial intelligence across all firms</p>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        <KPICard label="Total Revenue" value={fmt(summary?.total_revenue || 0)} change={8.2} icon={DollarSign} color="var(--accent-blue)" />
        <KPICard label="Avg ROI" value={`${(summary?.average_roi || 0).toFixed(1)}%`} change={3.1} icon={TrendingUp} color="var(--accent-green)" />
        <KPICard label="Total Firms" value={summary?.total_firms || 0} icon={Building2} color="var(--accent-purple)" />
        <KPICard label="Total Staff" value={summary?.total_staff || 0} icon={Users} color="var(--accent-cyan)" />
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-title"><Activity size={14} /> ROI Time-Series (Firm {firmId})</div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tsChartData}>
                <defs>
                  <linearGradient id="roiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="roi" name="ROI %" stroke="#3b82f6" fill="url(#roiGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-title"><TrendingUp size={14} /> Top Firms by ROI</div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roiData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="firm_name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="roi_percentage" name="ROI %" fill="#3b82f6" radius={[0, 4, 4, 0]}
                  background={{ fill: 'rgba(255,255,255,0.02)', radius: [0, 4, 4, 0] }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">⚠️ Detected Bottlenecks</div>
        {bottlenecks.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>No bottlenecks detected.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {bottlenecks.slice(0, 5).map((b, i) => (
              <div key={i} className="rec-card">
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{b.firm_name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{b.description || b.bottleneck_type}</div>
                </div>
                <span className={`badge badge-${b.severity === 'high' ? 'red' : b.severity === 'medium' ? 'amber' : 'blue'}`}>
                  {b.severity || 'medium'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
