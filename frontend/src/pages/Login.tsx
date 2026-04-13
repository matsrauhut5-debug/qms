import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await client.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('user', JSON.stringify(res.data));
      if (res.data.must_change_password) {
        navigate('/change-password');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--body-bg)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <nav style={{
        background: 'var(--nav-bg)',
        height: '52px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
      }}>
        <span style={{ fontSize: '16px', fontWeight: 700, color: '#60a5fa', letterSpacing: '-0.4px' }}>
          QMS
        </span>
      </nav>

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}>
        <div style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: '14px',
          padding: '40px',
          width: '100%',
          maxWidth: '400px',
        }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
            Welcome back
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 28px' }}>
            Sign in to your quality management system
          </p>

          {error && (
            <div style={{
              background: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '13px',
              color: '#991b1b',
              marginBottom: '16px',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                style={{
                  width: '100%',
                  height: '40px',
                  border: '1.5px solid var(--card-border)',
                  borderRadius: '8px',
                  padding: '0 12px',
                  fontSize: '13px',
                  background: '#f8fafc',
                  outline: 'none',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  height: '40px',
                  border: '1.5px solid var(--card-border)',
                  borderRadius: '8px',
                  padding: '0 12px',
                  fontSize: '13px',
                  background: '#f8fafc',
                  outline: 'none',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: '42px',
                background: loading ? '#93c5fd' : '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <hr style={{ border: 'none', borderTop: '1px solid var(--card-border)', margin: '24px 0' }} />
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
            Quality control · powered by QMS
          </p>
        </div>
      </div>
    </div>
  );
}