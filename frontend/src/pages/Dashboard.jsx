import { useState, useEffect } from 'react';
import api from '../services/api';
import SpendingBreakdown from '../components/SpendingBreakdown';

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonth(monthStr) {
  if (!monthStr) return '';
  const [year, m] = monthStr.split('-');
  const date = new Date(Number(year), Number(m) - 1);
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

function Dashboard() {
  const [month, setMonth] = useState(getCurrentMonth());
  const [refreshKey, setRefreshKey] = useState(0);
  const [salaryInput, setSalaryInput] = useState('');
  const [summary, setSummary] = useState(null);
  const [note, setNote] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const loadSummary = async (selectedMonth) => {
    setError('');
    try {
      const res = await api.get(`/transactions/summary/${selectedMonth}`);
      setSummary(res.data);
    } catch (err) {
      setSummary(null);
    }
  };

  useEffect(() => { loadSummary(month); }, [month]);

  const handleSetSalary = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/budget/salary', { month, salary: Number(salaryInput) });
      setSalaryInput('');
      await loadSummary(month);
    } catch (err) {
      const errData = err.response?.data;
      setError(typeof errData === 'string' ? errData : errData?.message || 'Failed to set salary');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    setError('');
    if (!note || !amount) return;
    setLoading(true);
    try {
      await api.post('/transactions', { month, note, amount: Number(amount) });
      setNote('');
      setAmount('');
      await loadSummary(month);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      const errData = err.response?.data;
      setError(typeof errData === 'string' ? errData : errData?.message || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      await loadSummary(month);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      setError(err.response?.data || 'Failed to delete transaction');
    }
  };

  // Spent percentage calculation
  const spentPct = summary && summary.salary > 0 
    ? Math.min(Math.round((summary.totalSpent / summary.salary) * 100), 100) 
    : 0;

  return (
    <div className="ps-shell animate-fade-in">
      {/* Sticky Top Navigation Bar */}
      <header className="ps-navbar">
        <div className="ps-nav-left">
          <a href="/dashboard" className="ps-brand-logo">
            Pay<span>Split</span>
          </a>
        </div>
        <div className="ps-nav-right">
          <a href="/dashboard" className="ps-nav-link active">
            📊 Dashboard
          </a>
          <a href="/login" className="ps-nav-link logout">
            🚪 Log out
          </a>
        </div>
      </header>

      {/* Main Dashboard Container */}
      <main className="ps-main">
        {/* Header Title & Date Row */}
        <div className="ps-header-row">
          <div className="ps-title-group">
            <h1>Financial Overview</h1>
            <div className="ps-date-badge">📅 {today}</div>
          </div>

          <div className="ps-month-picker-wrap">
            <label>Select Month:</label>
            <input
              type="month"
              className="ps-month-input"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="ps-alert ps-alert-error" style={{ marginBottom: 24 }}>
            <span>⚠</span> {error}
          </div>
        )}

        {/* 3-Column Summary Cards Grid */}
        {summary && (
          <>
            <div className="ps-summary-grid">
              {/* Card 1: Monthly Salary */}
              <div className="ps-stat-card">
                <div className="lbl">
                  <span>Monthly Salary</span>
                  <span>💰</span>
                </div>
                <div className="val">₹{summary.salary.toLocaleString('en-IN')}</div>
              </div>

              {/* Card 2: Total Spent */}
              <div className="ps-stat-card">
                <div className="lbl">
                  <span>Total Spent</span>
                  <span>💸</span>
                </div>
                <div className="val">₹{summary.totalSpent.toLocaleString('en-IN')}</div>
              </div>

              {/* Card 3: Remaining Balance */}
              <div className="ps-stat-card remaining">
                <div className="lbl">
                  <span>Remaining Balance</span>
                  <span>🏦</span>
                </div>
                <div className="val">₹{summary.remaining.toLocaleString('en-IN')}</div>
              </div>
            </div>

            {/* Budget Utilization Progress Bar Card */}
            <div className="ps-progress-card">
              <div className="ps-progress-header">
                <span style={{ color: 'var(--text-secondary)' }}>Budget Utilization</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{spentPct}% Used</span>
              </div>
              <div className="ps-progress-track">
                <div 
                  className="ps-progress-fill" 
                  style={{ 
                    width: `${spentPct}%`,
                    background: spentPct > 90 ? 'var(--accent-rose)' : 'linear-gradient(90deg, #6366f1 0%, #10b981 100%)' 
                  }} 
                />
              </div>
            </div>
          </>
        )}

        {/* 2-Column Actions Forms Grid */}
        <div className="ps-forms-grid">
          {/* Form 1: Set Salary */}
          <div className="ps-card">
            <div className="ps-card-title">Set Monthly Salary</div>
            <div className="ps-card-subtitle">Define your total income budget for {formatMonth(month)}</div>
            
            <form onSubmit={handleSetSalary} className="ps-form">
              <div className="ps-field">
                <label>Salary Amount (₹)</label>
                <input
                  type="number"
                  className="ps-input"
                  placeholder=""
                  value={salaryInput}
                  onChange={(e) => setSalaryInput(e.target.value)}
                  required
                />
              </div>

              {/* Preset Chips */}
              <div className="ps-field">
                <label style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Quick Presets</label>
                <div className="ps-chip-group">
                  <button type="button" className="ps-chip" onClick={() => setSalaryInput('50000')}>₹50,000</button>
                  <button type="button" className="ps-chip" onClick={() => setSalaryInput('75000')}>₹75,000</button>
                  <button type="button" className="ps-chip" onClick={() => setSalaryInput('100000')}>₹1,00,000</button>
                  <button type="button" className="ps-chip" onClick={() => setSalaryInput('150000')}>₹1,50,000</button>
                </div>
              </div>

              <button className="ps-btn ps-btn-secondary" type="submit" disabled={loading} style={{ marginTop: 4 }}>
                {loading ? 'Saving...' : 'Set Salary'}
              </button>
            </form>
          </div>

          {/* Form 2: Add Expense */}
          <div className="ps-card">
            <div className="ps-card-title">Add Expense Item</div>
            <div className="ps-card-subtitle">Record a new transaction to your monthly ledger</div>

            <form onSubmit={handleAddTransaction} className="ps-form">
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div className="ps-field">
                  <label>Category / Note</label>
                  <input
                    type="text"
                    className="ps-input"
                    placeholder=""
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    required
                  />
                </div>
                <div className="ps-field">
                  <label>Amount (₹)</label>
                  <input
                    type="number"
                    className="ps-input"
                    placeholder=""
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Category Quick Chips */}
              <div className="ps-field">
                <label style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Category Presets</label>
                <div className="ps-chip-group">
                  <button type="button" className="ps-chip" onClick={() => setNote('House Rent')}>🏠 Rent</button>
                  <button type="button" className="ps-chip" onClick={() => setNote('Groceries')}>🛒 Groceries</button>
                  <button type="button" className="ps-chip" onClick={() => setNote('Electricity')}>⚡ Utilities</button>
                  <button type="button" className="ps-chip" onClick={() => setNote('Dining Out')}>🍕 Dining</button>
                  <button type="button" className="ps-chip" onClick={() => setNote('Internet & Wifi')}>📶 Internet</button>
                </div>
              </div>

              <button className="ps-btn ps-btn-primary" type="submit" disabled={loading} style={{ marginTop: 4 }}>
                {loading ? 'Adding...' : '+ Add Expense'}
              </button>
            </form>
          </div>
        </div>

        {/* Expense Ledger Section */}
        {summary && (
          <div className="ps-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div className="ps-card-title">Ledger — {formatMonth(month)}</div>
                <div className="ps-card-subtitle" style={{ margin: 0 }}>Detailed record of all transactions for this month</div>
              </div>
              <div className="ps-date-badge">{summary.transactions.length} Transactions</div>
            </div>

            {summary.transactions.length === 0 ? (
              <div className="ps-empty-box">
                <div className="ps-empty-icon">📝</div>
                <div className="ps-empty-text">No expenses logged for {formatMonth(month)} yet. Use the form above to add your first expense.</div>
              </div>
            ) : (
              <div className="ps-table-wrap">
                <table className="ps-ledger-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Category / Note</th>
                      <th>Date Added</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.transactions.map((t, i) => (
                      <tr key={t.id}>
                        <td className="index">{(i + 1).toString().padStart(2, '0')}</td>
                        <td className="note">{t.note}</td>
                        <td className="date">{t.date}</td>
                        <td className="amount">₹{t.amount.toLocaleString('en-IN')}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="ps-btn-danger" onClick={() => handleDelete(t.id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        
        {/* Spending Breakdown Category Chart/Table Component */}
        {summary && <SpendingBreakdown month={month} refreshKey={refreshKey} />}
      </main>
    </div>
  );
}

export default Dashboard;