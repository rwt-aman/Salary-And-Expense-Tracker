import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { email, otp });
      const resData = res.data;
      setMessage(typeof resData === 'string' ? resData : resData?.message || 'Verification successful! Redirecting...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const errData = err.response?.data;
      setError(typeof errData === 'string' ? errData : errData?.message || 'Verification failed. Please check the code.');
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
            <h1>Email Verification Step.</h1>
            <p>
              We've sent a 6-digit verification code to your email address to confirm your account identity.
            </p>

            <div className="ps-feature-list">
              <div className="ps-feature-item">
                <div className="ps-feature-icon">✓</div>
                <span>Secures Your Personal Ledger</span>
              </div>
              <div className="ps-feature-item">
                <div className="ps-feature-icon">✓</div>
                <span>Prevents Unauthorized Access</span>
              </div>
            </div>
          </div>

          <div style={{ color: 'var(--text-tertiary)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
            Step 2 of 2 — Verification
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="ps-auth-form-side">
          <div className="ps-auth-card">
            <div className="ps-auth-header">
              <h2>Verify your email</h2>
              <p>Enter the verification code sent to your email</p>
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
                <label>Verification OTP Code</label>
                <input
                  type="text"
                  className="ps-input"
                  style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.2em', fontSize: '1.1rem' }}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder=""
                  maxLength={6}
                  required
                />
              </div>

              {error && (
                <div className="ps-alert ps-alert-error">
                  <span>⚠</span> {error}
                </div>
              )}

              {message && (
                <div className="ps-alert ps-alert-success">
                  <span>✓</span> {message}
                </div>
              )}

              <button type="submit" disabled={loading} className="ps-btn ps-btn-primary" style={{ marginTop: 8 }}>
                {loading ? 'Verifying...' : 'Verify Email →'}
              </button>
            </form>

            <div className="ps-auth-footer">
              Didn't receive code? <a href="/login">Back to Login</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyOtp;