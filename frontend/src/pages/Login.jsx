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