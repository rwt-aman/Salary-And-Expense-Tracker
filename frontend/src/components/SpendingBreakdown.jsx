import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#06b6d4', '#ec4899', '#8b5cf6', '#f43f5e'];

function formatMonth(monthStr) {
  if (!monthStr) return '';
  const [year, m] = monthStr.split('-');
  const date = new Date(Number(year), Number(m) - 1);
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

function SpendingBreakdown({ month, refreshKey }) {
  const [data, setData] = useState([]);
  const [view, setView] = useState('chart'); // 'chart' or 'table'

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await api.get(`/transactions/aggregate/category/${month}`);
        setData(res.data);
      } catch (err) {
        setData([]);
      }
    };
    loadData();
  }, [month, refreshKey]);

  const total = data.reduce((sum, d) => sum + d.total, 0);

  return (
    <div className="ps-card">
      <div className="ps-breakdown-header">
        <div>
          <div className="ps-card-title">Spending Breakdown — {formatMonth(month)}</div>
          <div className="ps-card-subtitle" style={{ margin: 0 }}>Category distribution for your monthly expenses</div>
        </div>
        
        <div className="ps-toggle">
          <button
            type="button"
            className={view === 'chart' ? 'ps-toggle-btn active' : 'ps-toggle-btn'}
            onClick={() => setView('chart')}
          >
            Chart
          </button>
          <button
            type="button"
            className={view === 'table' ? 'ps-toggle-btn active' : 'ps-toggle-btn'}
            onClick={() => setView('table')}
          >
            Table
          </button>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="ps-empty-box">
          <div className="ps-empty-icon">📊</div>
          <div className="ps-empty-text">No category breakdown data available for {formatMonth(month)}.</div>
        </div>
      ) : view === 'chart' ? (
        <div style={{ width: '100%', height: 380, marginTop: 12 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="total"
                nameKey="note"
                cx="50%"
                cy="50%"
                outerRadius={125}
                innerRadius={65}
                paddingAngle={4}
                label={({ note, percent }) => `${note} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={entry.note} fill={COLORS[index % COLORS.length]} stroke="rgba(15, 23, 42, 0.8)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`}
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderColor: 'rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontFamily: 'var(--font-mono)'
                }}
              />
              <Legend wrapperStyle={{ color: 'var(--text-secondary)', fontSize: '0.9rem', paddingTop: '16px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="ps-table-wrap">
          <table className="ps-ledger-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th style={{ textAlign: 'right' }}>% of Total</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d, i) => (
                <tr key={d.note}>
                  <td className="index">{(i + 1).toString().padStart(2, '0')}</td>
                  <td className="note">{d.note}</td>
                  <td className="amount">₹{d.total.toLocaleString('en-IN')}</td>
                  <td className="amount" style={{ color: 'var(--text-secondary)' }}>
                    {total ? ((d.total / total) * 100).toFixed(1) : 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default SpendingBreakdown;