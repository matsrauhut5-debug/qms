import React from 'react';
import TopNav from '../components/TopNav';

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--body-bg)' }}>
      <TopNav />
      <div style={{ padding: '24px 32px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
            Dashboard
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          marginBottom: '24px',
        }}>
          {[
            { label: 'Results today', value: '—', sub: 'no data yet', color: 'var(--text-primary)' },
            { label: 'Pass rate', value: '—', sub: 'no data yet', color: 'var(--pass)' },
            { label: 'Warnings', value: '—', sub: 'no data yet', color: 'var(--warn)' },
            { label: 'Failures', value: '—', sub: 'no data yet', color: 'var(--fail)' },
          ].map((kpi) => (
            <div key={kpi.label} style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              borderRadius: '10px',
              padding: '16px 18px',
            }}>
              <div style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '6px' }}>
                {kpi.label}
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: kpi.color, lineHeight: 1 }}>
                {kpi.value}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {kpi.sub}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: '10px',
          padding: '20px 24px',
        }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px' }}>
            Recent results
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            No results yet. Once your team starts entering test data it will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}