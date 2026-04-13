import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Enter results', path: '/enter' },
  { label: 'Results', path: '/results' },
  { label: 'Batches', path: '/batches' },
  { label: 'Analytics', path: '/analytics' },
  { label: 'Settings', path: '/settings' },
];

export default function TopNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const initials = user.full_name
    ? user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : 'U';

  return (
    <nav style={{
      background: 'var(--nav-bg)',
      height: '52px',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        fontSize: '16px',
        fontWeight: 700,
        color: '#60a5fa',
        letterSpacing: '-0.4px',
        marginRight: '32px',
        cursor: 'pointer',
      }} onClick={() => navigate('/dashboard')}>
        QMS
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: active ? '2.5px solid #3b82f6' : '2.5px solid transparent',
                height: '52px',
                padding: '0 14px',
                fontSize: '13px',
                fontWeight: active ? 600 : 400,
                color: active ? '#ffffff' : '#94a3b8',
                cursor: 'pointer',
                transition: 'color 0.15s',
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '12px', color: '#64748b' }}>
          {user.full_name || 'User'}
        </span>
        <div
          onClick={handleLogout}
          title="Sign out"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#1e40af',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 600,
            color: '#93c5fd',
            cursor: 'pointer',
          }}
        >
          {initials}
        </div>
      </div>
    </nav>
  );
}