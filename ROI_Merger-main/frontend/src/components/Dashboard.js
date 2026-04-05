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
        <div key={i} style={{ fontSize: 13, fontWeight: 600, color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
        </div>
      ))}
    </div>
  );
};

function KPICard({ label, value, sub, icon: Icon, color, positive }) {
  return (
    <div className="kpi-card fade-in">
      <div className="kpi-icon" style={{ background: `${color}20` }}>
        <Icon size={18} color={color} />
      </div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {sub && (
        <div className={`kpi-change ${positive !== false ? 'positive' : 'negative'}`}>
          {positive !== false ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {sub}
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
  const [firmRoi, setFirmRoi] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [firmId]); // eslint-disable-line react-hooks/exhaustive-deps

  const load = async () => {
    setLoading(true);
    try {
      const [sum, roi, bn, ts, firms, fRoi] = await Promise.all([
        api.getDashboardSummary(),
        api.getROI(),
        api.getBottlenecks(),
        api.getTimeseries(firmId),
        api.getFirms(20),
        api.getROI(firmId),
      ]);

      setSummary(sum);
      setFirmRoi(fRoi);

      const firmMap = {};
      (firms.firms || []).forEach(f => { firmMap[f.firm_id] = f.firm_name; });

      const enriched = (roi.roi_metrics || []).slice(0, 10).map(r => ({
        ...r,
        firm_name: firmMap[r.firm_id] || `Firm ${r.firm_id}`,
        roi_percentage: parseFloat((r.roi_percentage || 0).toFixed(1)),
        revenue: parseFloat(r.revenue || 0),
        costs: parseFloat(r.costs || 0),
        net_profit: parseFloat(r.net_profit || (r.revenue - r.costs) || 0),
      }));
      setRoiData(enriched);
      setBottlenecks(bn.bottlenecks || []);
      setTimeseries(ts.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (v) => new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0
  }).format(v);

  const fmtShort = (v) => {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
    return fmt(v);
  };

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
        <div className="grid-2">
          <div className="skeleton" style={{ height: 300 }} />
          <div className="skeleton" style={{ height: 300 }} />
        </div>
      </div>
    );
  }

  // Selected firm metrics
  const selectedRevenue = parseFloat(firmRoi?.revenue || 0);
  const selectedCosts = parseFloat(firmRoi?.costs || 0);
  const selectedRoi = parseFloat(firmRoi?.roi_percentage || 0);
  const selectedProfit = selectedRevenue - selectedCosts;
  const selectedFirmName = firmRoi?.firm_name || `Firm ${firmId}`;

  // Timeseries chart data
  const tsChartData = timeseries.map(r => ({
    date: r.timestamp ? String(r.timestamp).slice(0, 7) : '',
    roi: parseFloat(parseFloat(r.roi || 0).toFixed(1)),
    revenue: parseFloat(r.cash_flow || 0),
  }));

  // ROI trend from timeseries
  const roiTrend = tsChartData.length >= 2
    ? (tsChartData[tsChartData.length - 1].roi - tsChartData[0].roi).toFixed(1)
    : null;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Executive Dashboard</h1>
        <p className="page-subtitle">{selectedFirmName} — financial intelligence overview</p>
      </div>

      {/* KPIs — selected firm data */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <KPICard
          label="Firm Revenue"
          value={fmtShort(selectedRevenue)}
          sub={`${summary?.total_firms || 0} firms total`}
          icon={DollarSign}
          color="var(--accent-blue)"
          positive={true}
        />
        <KPICard
          label="Firm ROI"
          value={`${selectedRoi.toFixed(1)}%`}
          sub={roiTrend ? `${roiTrend > 0 ? '+' : ''}${roiTrend}% trend` : `Avg: ${(summary?.average_roi || 0).toFixed(1)}%`}
          icon={TrendingUp}
          color="var(--accent-green)"
          positive={selectedRoi >= 0}
        />
        <KPICard
          label="Net Profit"
          value={fmtShort(selectedProfit)}
          sub={`Costs: ${fmtShort(selectedCosts)}`}
          icon={Building2}
          color="var(--accent-purple)"
          positive={selectedProfit >= 0}
        />
        <KPICard
          label="Total Staff"
          value={summary?.total_staff || 0}
          sub={`Across ${summary?.total_firms || 0} firms`}
          icon={Users}
          color="var(--accent-cyan)"
          positive={true}
        />
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* ROI timeseries for selected firm */}
        <div className="card">
          <div className="card-title">
            <Activity size={14} /> ROI Time-Series — {selectedFirmName}
          </div>
          {tsChartData.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '40px 0', textAlign: 'center' }}>
              No monthly sales data available for this firm.
            </div>
          ) : (
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
                  <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false}
                    tickFormatter={v => `${v.toFixed(0)}%`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="roi" name="ROI %"
                    stroke="#3b82f6" fill="url(#roiGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* All firms ROI comparison */}
        <div className="card">
          <div className="card-title"><TrendingUp size={14} /> All Firms — ROI Comparison</div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roiData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${v.toFixed(0)}%`} />
                <YAxis type="category" dataKey="firm_name" tick={{ fill: '#94a3b8', fontSize: 10 }}
                  axisLine={false} tickLine={false} width={115} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="roi_percentage" name="ROI %"
                  fill="#3b82f6" radius={[0, 4, 4, 0]}
                  background={{ fill: 'rgba(255,255,255,0.02)', radius: [0, 4, 4, 0] }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Full ROI breakdown table — all firms, all different values */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-title">📊 All Firms — ROI Breakdown</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Firm', 'Revenue', 'Costs', 'Net Profit', 'ROI %'].map(h => (
                  <th key={h} style={{
                    padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)',
                    fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roiData.map((r, i) => (
                <tr key={i} style={{
                  borderBottom: '1px solid var(--border)',
                  background: r.firm_id === firmId ? 'rgba(59,130,246,0.06)' : 'transparent'
                }}>
                  <td style={{ padding: '10px 12px', color: 'var(--text-primary)', fontWeight: r.firm_id === firmId ? 700 : 500 }}>
                    {r.firm_id === firmId ? '▶ ' : ''}{r.firm_name}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--accent-blue)' }}>{fmt(r.revenue)}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{fmt(r.costs)}</td>
                  <td style={{ padding: '10px 12px', color: r.net_profit >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                    {fmt(r.net_profit)}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span className={`badge badge-${r.roi_percentage > 100 ? 'green' : r.roi_percentage > 0 ? 'blue' : 'red'}`}>
                      {r.roi_percentage.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                    {b.firm_name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {b.description || b.bottleneck_type}
                  </div>
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
