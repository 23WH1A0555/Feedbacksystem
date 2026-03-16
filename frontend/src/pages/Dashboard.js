import React, { useState, useEffect } from 'react';
import { statsAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

const COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
const CATEGORY_COLORS = { general: '#7c3aed', bug: '#ef4444', feature: '#10b981', support: '#f59e0b', other: '#8888bb' };

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-bright)', borderRadius: 10, padding: '0.75rem 1rem', fontSize: '0.85rem' }}>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color || 'var(--text-primary)', fontWeight: 600 }}>{p.name}: {p.value}</p>)}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsAPI.get().then(res => setStats(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" />Loading dashboard...</div>;
  if (!stats) return <div className="empty-state"><div className="empty-icon">⚠</div><p>Could not load data. Is the backend running?</p></div>;

  const categoryData = Object.entries(stats.categoryBreakdown).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1), value, fill: CATEGORY_COLORS[name] || '#7c3aed'
  }));

  const statusCards = [
    { label: 'Total Responses', value: stats.total, icon: '◈', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
    { label: 'Avg Rating', value: `${stats.averageRating}★`, icon: '★', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
    { label: 'New', value: stats.statusBreakdown.new, icon: '●', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
    { label: 'Resolved', value: stats.statusBreakdown.resolved, icon: '✓', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  ];

  return (
    <div>
      <div className="page-header"><h1>Analytics</h1><p>Overview of all submitted feedback.</p></div>
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        {statusCards.map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <h3 style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.9rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>RATING DISTRIBUTION</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.ratingDistribution} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(42,42,74,0.8)" vertical={false} />
              <XAxis dataKey="rating" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} tickFormatter={v => `${v}★`} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124,58,237,0.05)' }} />
              <Bar dataKey="count" name="Count" radius={[6, 6, 0, 0]}>
                {stats.ratingDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.9rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>CATEGORY BREAKDOWN</h3>
          {categoryData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {categoryData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {categoryData.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: c.fill, flexShrink: 0 }} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', flex: 1 }}>{c.name}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{c.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <div className="empty-state"><p>No data yet</p></div>}
        </div>
      </div>
      {stats.monthlyTrend.length > 0 && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.9rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>MONTHLY TREND</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={stats.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(42,42,74,0.8)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" domain={[1, 5]} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }} />
              <Line yAxisId="left" type="monotone" dataKey="count" name="Submissions" stroke="#7c3aed" strokeWidth={2.5} dot={{ fill: '#7c3aed', r: 4 }} />
              <Line yAxisId="right" type="monotone" dataKey="avgRating" name="Avg Rating" stroke="#06b6d4" strokeWidth={2.5} dot={{ fill: '#06b6d4', r: 4 }} strokeDasharray="5 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      {stats.recentFeedback?.length > 0 && (
        <div className="card">
          <h3 style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.9rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>RECENT SUBMISSIONS</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stats.recentFeedback.map(fb => (
              <div key={fb._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--accent-glow)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Mono', monospace", fontWeight: 700, color: 'var(--accent-bright)', fontSize: '0.85rem', flexShrink: 0 }}>
                  {fb.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{fb.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fb.subject}</div>
                </div>
                <div style={{ color: 'var(--gold)', fontSize: '0.85rem' }}>{'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}</div>
                <span className={`badge badge-${fb.category}`}>{fb.category}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}