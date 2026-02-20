import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend
} from 'chart.js';
import { getMonthlySavings, getMonthlyTotals } from '../utils/storage';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function SavingsView({ expenses, incomes, onBack }) {
  const savings = useMemo(() => getMonthlySavings(expenses, incomes), [expenses, incomes]);
  const expTotals = useMemo(() => getMonthlyTotals(expenses), [expenses]);
  const incTotals = useMemo(() => getMonthlyTotals(incomes), [incomes]);

  const sorted = Object.entries(savings).sort((a, b) => a[0].localeCompare(b[0])).slice(-12);

  const totalSaved = sorted.reduce((s, [, v]) => s + v, 0);
  const totalIncome = Object.values(incTotals).reduce((s, v) => s + v, 0);
  const totalExpense = Object.values(expTotals).reduce((s, v) => s + v, 0);
  const avgSavings = sorted.length > 0 ? totalSaved / sorted.length : 0;
  const savingsRate = totalIncome > 0 ? ((totalSaved / totalIncome) * 100) : 0;

  const labels = sorted.map(([m]) => {
    const [y, mo] = m.split('-');
    return new Date(y, mo - 1).toLocaleString('default', { month: 'short', year: '2-digit' });
  });

  const barData = {
    labels,
    datasets: [
      { label: 'Income', data: sorted.map(([key]) => incTotals[key] || 0), backgroundColor: '#2a9d8f', borderRadius: 4 },
      { label: 'Expenses', data: sorted.map(([key]) => expTotals[key] || 0), backgroundColor: '#e76f51', borderRadius: 4 },
    ],
  };

  const savingsBarData = {
    labels,
    datasets: [{
      label: 'Net Savings',
      data: sorted.map(([, v]) => v),
      backgroundColor: sorted.map(([, v]) => v >= 0 ? '#2a9d8f' : '#e76f51'),
      borderRadius: 4,
    }],
  };

  return (
    <div className="page">
      <div className="page-top">
        {onBack && <button className="back-btn" onClick={onBack}>&#8592; Home</button>}
        <h2>Savings</h2>
      </div>

      <div className="stats-grid">
        <div className="card stat-card">
          <span className="stat-label">Total Saved</span>
          <span className={`stat-value ${totalSaved >= 0 ? 'positive' : 'negative'}`}>{totalSaved.toFixed(0)}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Savings Rate</span>
          <span className={`stat-value ${savingsRate >= 0 ? 'positive' : 'negative'}`}>{savingsRate.toFixed(1)}%</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Avg Monthly</span>
          <span className={`stat-value ${avgSavings >= 0 ? 'positive' : 'negative'}`}>{avgSavings.toFixed(0)}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Months Tracked</span>
          <span className="stat-value">{sorted.length}</span>
        </div>
      </div>

      {sorted.length > 0 && (
        <>
          <div className="card">
            <h3>Income vs Expenses</h3>
            <div className="chart-container">
              <Bar data={barData}
                options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 8, font: { size: 10 } } } },
                  scales: {
                    y: { beginAtZero: true, grid: { color: 'var(--grid)' } },
                    x: { grid: { display: false } },
                  },
                }}
              />
            </div>
          </div>

          <div className="card">
            <h3>Net Savings by Month</h3>
            <div className="chart-container">
              <Bar data={savingsBarData}
                options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { grid: { color: 'var(--grid)' } },
                    x: { grid: { display: false } },
                  },
                }}
              />
            </div>
          </div>
        </>
      )}

      <div className="card">
        <h3>Monthly Detail</h3>
        <div className="breakdown-list">
          {sorted.slice().reverse().map(([key, net]) => {
            const [y, mo] = key.split('-');
            const label = new Date(y, mo - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
            const inc = incTotals[key] || 0;
            const exp = expTotals[key] || 0;
            return (
              <div key={key} className="breakdown-row savings-row">
                <div>
                  <span className="savings-month">{label}</span>
                  <span className="savings-detail">In: {inc.toFixed(0)} | Out: {exp.toFixed(0)}</span>
                </div>
                <span className={`breakdown-amount ${net >= 0 ? 'positive' : 'negative'}`}>
                  {net >= 0 ? '+' : ''}{net.toFixed(0)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
