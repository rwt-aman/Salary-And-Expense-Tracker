import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { setAuthToken } from '../services/api';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  // Inline OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  const navigate = useNavigate();

  // 1-Click Demo Login using demo123@gmail.com / demo123
  const handleQuickDemoLogin = async () => {
    setError('');
    setDemoLoading(true);
    try {
      const res = await api.post('/auth/login', {
        email: 'demo123@gmail.com',
        password: 'demo123',
      });
      setAuthToken(res.data);
      navigate('/dashboard');
    } catch (err) {
      const errData = err.response?.data;
      setError(typeof errData === 'string' ? errData : errData?.message || 'Demo login failed');
    } finally {
      setDemoLoading(false);
    }
  };

  // Step 1: Send Registration & Trigger OTP
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', { name, email, password });
      setOtpSent(true);
      setSuccess(`Verification code sent to ${email}! Please enter it below.`);
    } catch (err) {
      const errData = err.response?.data;
      setError(typeof errData === 'string' ? errData : errData?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP inline right below fields
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccess('');

    if (!otp || otp.length !== 6) {
      setError('Please enter the full 6-digit OTP code');
      return;
    }

    setVerifying(true);
    try {
      await api.post('/auth/verify-otp', { email, otp });
      setSuccess('Account verified successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login', { state: { registeredEmail: email } });
      }, 1500);
    } catch (err) {
      const errData = err.response?.data;
      setError(typeof errData === 'string' ? errData : errData?.message || 'Invalid or expired OTP code');
    } finally {
      setVerifying(false);
    }
  };

  // Optional: Resend OTP
  const handleResendOtp = async () => {
    setError('');
    setSuccess('');
    setResending(true);
    try {
      await api.post('/auth/register', { name, email, password });
      setSuccess('A new 6-digit OTP has been sent to your email.');
    } catch (err) {
      const errData = err.response?.data;
      setError(typeof errData === 'string' ? errData : errData?.message || 'Failed to resend code');
    } finally {
      setResending(false);
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
                <span>High-Speed Cloud Performance</span>
              </div>
            </div>
          </div>

          <div style={{ color: 'var(--text-tertiary)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
            {otpSent ? 'Step 2 of 2 — Email Verification' : 'Step 1 of 2 — Account Creation'}
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
                  onClick={handleQuickDemoLogin}
                  disabled={demoLoading}
                  className="ps-btn"
                  style={{
                    padding: '5px 12px',
                    fontSize: '12px',
                    background: '#6366f1',
                    color: '#ffffff',
                    borderRadius: '6px',
                    border: 'none',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
                  }}
                >
                  {demoLoading ? 'Logging in...' : '1-Click Demo Login →'}
                </button>
              </div>
              <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5' }}>
                <div>Email: <strong style={{ color: '#ffffff', fontFamily: 'monospace' }}>demo123@gmail.com</strong></div>
                <div>Password: <strong style={{ color: '#ffffff', fontFamily: 'monospace' }}>demo123</strong></div>
              </div>
            </div>

            <div className="ps-auth-header">
              <h2>Create your account</h2>
              <p>Enter your details below to get started</p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="ps-form">
              <div className="ps-field">
                <label>Full Name</label>
                <input
                  type="text"
                  className="ps-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  autoComplete="name"
                  disabled={otpSent}
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
                  placeholder="e.g. yourname@gmail.com"
                  autoComplete="email"
                  disabled={otpSent}
                  required
                />
                <span style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', display: 'block', lineHeight: '1.4' }}>
                  💡 Please enter a <strong>real email address</strong> to receive your 6-digit verification OTP.
                </span>
              </div>

              <div className="ps-field">
                <label>Password</label>
                <input
                  type="password"
                  className="ps-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  disabled={otpSent}
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
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  disabled={otpSent}
                  required
                />
              </div>

              {/* Step 1 Submit Button (Only when OTP is not sent yet) */}
              {!otpSent && (
                <button type="submit" disabled={loading} className="ps-btn ps-btn-primary" style={{ marginTop: 8 }}>
                  {loading ? 'Sending OTP Code...' : 'Register & Send OTP →'}
                </button>
              )}
            </form>

            {/* Step 2 Inline OTP Verification Section (Right Below Form) */}
            {otpSent && (
              <div
                className="animate-fade-in"
                style={{
                  marginTop: '20px',
                  padding: '18px',
                  background: 'rgba(15, 23, 42, 0.75)',
                  border: '1px solid rgba(99, 102, 241, 0.4)',
                  borderRadius: '10px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    🔑 Enter 6-Digit OTP Code
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setSuccess('');
                      setError('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#818cf8',
                      fontSize: '12px',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      padding: 0,
                    }}
                  >
                    Edit Info
                  </button>
                </div>

                <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '14px', lineHeight: '1.4' }}>
                  A 6-digit code has been sent to <strong style={{ color: '#fff' }}>{email}</strong>. Please check your inbox or spam folder.
                </p>

                <div className="ps-field">
                  <input
                    type="text"
                    className="ps-input"
                    style={{
                      textAlign: 'center',
                      fontSize: '22px',
                      letterSpacing: '10px',
                      fontFamily: 'monospace',
                      fontWeight: '700',
                      padding: '12px',
                      borderColor: 'rgba(99, 102, 241, 0.5)',
                    }}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="------"
                    maxLength={6}
                    autoFocus
                  />
                </div>

                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={verifying || otp.length !== 6}
                  className="ps-btn ps-btn-primary"
                  style={{ width: '100%', marginTop: '10px' }}
                >
                  {verifying ? 'Verifying OTP...' : 'Verify OTP & Complete Registration ✓'}
                </button>

                <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
                  Didn't receive the email?{' '}
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resending}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#818cf8',
                      cursor: 'pointer',
                      fontWeight: '600',
                      padding: 0,
                    }}
                  >
                    {resending ? 'Resending...' : 'Resend Code'}
                  </button>
                </div>
              </div>
            )}

            {/* Error & Success Feedback */}
            {error && (
              <div className="ps-alert ps-alert-error" style={{ marginTop: 14 }}>
                <span>⚠</span> {error}
              </div>
            )}

            {success && (
              <div className="ps-alert" style={{ marginTop: 14, background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#4ade80' }}>
                <span>✓</span> {success}
              </div>
            )}

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