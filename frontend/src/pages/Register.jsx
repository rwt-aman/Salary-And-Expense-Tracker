import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', { name, email, password });
      // Pass email to OTP page
      navigate('/verify-otp', { state: { email } });
    } catch (err) {
      const errData = err.response?.data;
      setError(typeof errData === 'string' ? errData : errData?.message || 'Registration failed');
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
            <h1>Start Splitting with Absolute Precision.</h1>
            <p>
              Join users organizing personal finances, monthly salaries, and shared expenses in a clean dark workspace.
            </p>

            <div className="ps-feature-list">
              <div className="ps-feature-item">
                <div className="ps-feature-icon">✓</div>
                <span>Free Account Setup & Verification</span>
              </div>
              <div className="ps-feature-item">
                <div className="ps-feature-icon">✓</div>
                <span>Categorized Ledger & Analytics</span>
              </div>
              <div className="ps-feature-item">
                <div className="ps-feature-icon">✓</div>
                <span>High-Speed Performance</span>
              </div>
            </div>
          </div>

          <div style={{ color: 'var(--text-tertiary)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
            Step 1 of 2 — Account Creation
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="ps-auth-form-side">
          <div className="ps-auth-card">
            <div className="ps-auth-header">
              <h2>Create your account</h2>
              <p>Enter your details below to get started</p>
            </div>

            <form onSubmit={handleSubmit} className="ps-form">
              <div className="ps-field">
                <label>Full Name</label>
                <input
                  type="text"
                  className="ps-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder=""
                  autoComplete="name"
                  required
                />
              </div>

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
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="ps-field">
                <label>Confirm Password</label>
                <input
                  type="password"
                  className="ps-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder=""
                  autoComplete="new-password"
                  required
                />
              </div>

              {error && (
                <div className="ps-alert ps-alert-error">
                  <span>⚠</span> {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="ps-btn ps-btn-primary" style={{ marginTop: 8 }}>
                {loading ? 'Registering...' : 'Create Account →'}
              </button>
            </form>

            <div className="ps-auth-footer">
              Already have an account? <a href="/login">Log in</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;