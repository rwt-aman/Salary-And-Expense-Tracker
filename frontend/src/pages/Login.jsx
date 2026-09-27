import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { setAuthToken } from '../services/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      setAuthToken(res.data);
      navigate('/dashboard');
    } catch (err) {
      const errData = err.response?.data;
      setError(typeof errData === 'string' ? errData : errData?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ps-auth-wrapper animate-fade-in">
      <div className="ps-auth-split">
        {/* Left Brand Panel */}
        <div className="ps-auth-brand-side">
          <div>
            <a href="/" className="ps-brand-logo">
              Pay<span>Split</span>
            </a>
          </div>

          <div className="ps-brand-hero-content">
            <h1>Manage & Split Expenses with Absolute Clarity.</h1>
            <p>
              Welcome back to your workspace. Monitor monthly salaries, log categorized ledger entries, and visualize budget aggregates seamlessly.
            </p>

            <div className="ps-feature-list">
              <div className="ps-feature-item">
                <div className="ps-feature-icon">✓</div>
                <span>Instant Access to Financial Ledger</span>
              </div>
              <div className="ps-feature-item">
                <div className="ps-feature-icon">✓</div>
                <span>Categorized Monthly Aggregates</span>
              </div>
              <div className="ps-feature-item">
                <div className="ps-feature-icon">✓</div>
                <span>High Performance & Encrypted Session</span>
              </div>
            </div>
          </div>

          <div style={{ color: 'var(--text-tertiary)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
            Secure Portal — Version 2.0
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="ps-auth-form-side">
          <div className="ps-auth-card">
            {/* Quick Demo Access Box */}
            <div
              style={{
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '10px',
                padding: '14px 16px',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>⚡</span> Instant Demo Account
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('demo123@gmail.com');
                    setPassword('demo123');
                  }}
                  className="ps-btn"
                  style={{
                    padding: '4px 10px',
                    fontSize: '11px',
                    background: '#6366f1',
                    color: '#ffffff',
                    borderRadius: '6px',
                    border: 'none',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Auto-Fill Demo Credentials
                </button>
              </div>
              <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5' }}>
                <div>Email: <strong style={{ color: '#ffffff', fontFamily: 'monospace' }}>demo123@gmail.com</strong></div>
                <div>Password: <strong style={{ color: '#ffffff', fontFamily: 'monospace' }}>demo123</strong></div>
              </div>
            </div>

            <div className="ps-auth-header">
              <h2>Welcome back</h2>
              <p>Log in to access your budget overview</p>
            </div>

            <form onSubmit={handleSubmit} className="ps-form">
              <div className="ps-field">
                <label>Email Address</label>
                <input
                  type="email"
                  className="ps-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=""
                  autoComplete="email"
                  required
                />
              </div>

              <div className="ps-field">
                <label>Password</label>
                <input
                  type="password"
                  className="ps-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=""
                  autoComplete="current-password"
                  required
                />
              </div>

              {error && (
                <div className="ps-alert ps-alert-error">
                  <span>⚠</span> {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="ps-btn ps-btn-primary" style={{ marginTop: 8 }}>
                {loading ? 'Logging in...' : 'Log In →'}
              </button>
            </form>

            <div className="ps-auth-footer">
              Don't have an account? <a href="/register">Create an account</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;