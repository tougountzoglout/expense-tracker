import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip
} from 'chart.js';
import { getAverages, getUniqueMonths, getMonthlyTotals, getCategoryTotals, getMonthlySavings } from '../utils/storage';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const COLORS = [
  '#1b3a4b', '#3d6b7e', '#2a9d8f', '#e76f51', '#264653',
  '#457b9d', '#a8dadc', '#e9c46a', '#f4a261', '#8d99ae',
  '#6c757d', '#495057',
];

export default function Averages({ expenses, incomes }) {
  const expAvg = useMemo(() => getAverages(expenses), [expenses]);
  const incAvg = useMemo(() => getAverages(incomes), [incomes]);

  const expMonthlyTotals = useMemo(() => getMonthlyTotals(expenses), [expenses]);
  const incMonthlyTotals = useMemo(() => getMonthlyTotals(incomes), [incomes]);
  const savings = useMemo(() => getMonthlySavings(expenses, incomes), [expenses, incomes]);

  const allMonths = useMemo(() => {
    const set = new Set([...getUniqueMonths(expenses), ...getUniqueMonths(incomes)]);
    return Array.from(set).sort();
  }, [expenses, incomes]);

  const totalExp = expenses.reduce((s, e) => s + e.amount, 0);
  const totalInc = incomes.reduce((s, e) => s + e.amount, 0);
  const totalSaved = Object.values(savings).reduce((s, v) => s + v, 0);
  const savingsRate = totalInc > 0 ? (totalSaved / totalInc * 100) : 0;

  const expMonthVals = Object.values(expMonthlyTotals);
  const minExpMonth = expMonthVals.length ? Math.min(...expMonthVals) : 0;
  const maxExpMonth = expMonthVals.length ? Math.max(...expMonthVals) : 0;

  const sortedExpCats = Object.entries(expAvg.perCategory).sort((a, b) => b[1] - a[1]);
  const sortedIncCats = Object.entries(incAvg.perCategory).sort((a, b) => b[1] - a[1]);
  const allExpCatTotals = useMemo(() => getCategoryTotals(expenses), [expenses]);
  const allIncCatTotals = useMemo(() => getCategoryTotals(incomes), [incomes]);

  const expBarData = {
    labels: sortedExpCats.map(([c]) => c),
    datasets: [{
      label: 'Avg/mo',
      data: sortedExpCats.map(([, v]) => v),
      backgroundColor: COLORS.slice(0, sortedExpCats.length),
      borderRadius: 4,
    }],
  };

  return (
    <div className="page">
      <h2>Statistics</h2>

      {/* Overview stats */}
      <div className="stats-grid">
        <div className="card stat-card">
          <span className="stat-label">Avg Monthly Expense</span>
          <span className="stat-value negative">{expAvg.monthly.toFixed(0)}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Avg Monthly Income</span>
          <span className="stat-value positive">{incAvg.monthly.toFixed(0)}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Total Expenses</span>
          <span className="stat-value">{totalExp.toFixed(0)}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Total Income</span>
          <span className="stat-value">{totalInc.toFixed(0)}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Savings Rate</span>
          <span className={`stat-value ${savingsRate >= 0 ? 'positive' : 'negative'}`}>{savingsRate.toFixed(1)}%</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Total Saved</span>
          <span className={`stat-value ${totalSaved >= 0 ? 'positive' : 'negative'}`}>{totalSaved.toFixed(0)}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Cheapest Month</span>
          <span className="stat-value">{minExpMonth.toFixed(0)}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Most Expensive</span>
          <span className="stat-value">{maxExpMonth.toFixed(0)}</span>
        </div>
      </div>

      {/* Expense category averages chart */}
      {sortedExpCats.length > 0 && (
        <div className="card">
          <h3>Avg Expense by Category (Monthly)</h3>
          <div className="chart-container">
            <Bar data={expBarData}
              options={{
                responsive: true, maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: { legend: { display: false } },
                scales: {
                  x: { beginAtZero: true, grid: { color: 'var(--grid)' } },
                  y: { grid: { display: false } },
                },
              }}
            />
          </div>
        </div>
      )}

      {/* Expense category averages list */}
      <div className="card">
        <h3>Expense Category Averages</h3>
        <div className="breakdown-list">
          {sortedExpCats.map(([cat, avg]) => (
            <div key={cat} className="breakdown-row">
              <span>{cat}</span>
              <div className="breakdown-details">
                <span className="breakdown-amount">{avg.toFixed(2)}/mo</span>
                <span className="breakdown-total">({(allExpCatTotals[cat] || 0).toFixed(0)} total)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Income category averages list */}
      {sortedIncCats.length > 0 && (
        <div className="card">
          <h3>Income Source Averages</h3>
          <div className="breakdown-list">
            {sortedIncCats.map(([cat, avg]) => (
              <div key={cat} className="breakdown-row">
                <span>{cat}</span>
                <div className="breakdown-details">
                  <span className="breakdown-amount income-amount">{avg.toFixed(2)}/mo</span>
                  <span className="breakdown-total">({(allIncCatTotals[cat] || 0).toFixed(0)} total)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Savings monthly detail */}
      <div className="card">
        <h3>Monthly Balance History</h3>
        <div className="breakdown-list">
          {allMonths.slice().reverse().map(m => {
            const [y, mo] = m.split('-');
            const label = new Date(y, mo - 1).toLocaleString('default', { month: 'short', year: '2-digit' });
            const inc = incMonthlyTotals[m] || 0;
            const exp = expMonthlyTotals[m] || 0;
            const net = inc - exp;
            return (
              <div key={m} className="breakdown-row savings-row">
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
