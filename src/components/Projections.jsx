import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend
} from 'chart.js';
import { getAverages } from '../utils/storage';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Projections({ expenses, incomes, deposits, preferences }) {
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-indexed
  const currentYear = now.getFullYear();

  const salaryType = preferences?.salary_type || '14';
  const monthlySalary = parseFloat(preferences?.monthly_salary) || 0;

  const expAvg = useMemo(() => getAverages(expenses), [expenses]);
  const incAvg = useMemo(() => getAverages(incomes), [incomes]);
  const depAvg = useMemo(() => getAverages(deposits), [deposits]);

  const avgExpense = expAvg.monthly;
  const avgIncome = incAvg.monthly;
  const avgDeposit = depAvg.monthly;

  // For 14-month salary: extra half-salary in month index 3 (April/Easter) and 11 (December/Christmas)
  // These are approximate Greek standard bonus months
  const getMonthlyIncome = (monthIdx) => {
    if (salaryType === '14' && monthlySalary > 0) {
      const base = monthlySalary;
      if (monthIdx === 3) return base + base * 0.5; // Easter bonus (half)
      if (monthIdx === 5) return base + base * 0.5; // Summer bonus (half)
      if (monthIdx === 11) return base;              // Christmas bonus (full)
      return base;
    }
    return avgIncome;
  };

  // Build 12-month projection
  const months = [];
  let cumulativeAvailable = 0;
  let cumulativeSaved = 0;

  for (let i = 0; i < 12; i++) {
    const mIdx = (currentMonth + i) % 12;
    const label = MONTH_NAMES[mIdx];
    const projected_income = getMonthlyIncome(mIdx);
    const projected_expense = avgExpense;
    const projected_deposit = avgDeposit;
    const projected_available = projected_income - projected_expense - projected_deposit;

    cumulativeAvailable += projected_available;
    cumulativeSaved += projected_deposit;

    months.push({
      label, mIdx, projected_income, projected_expense,
      projected_deposit, projected_available,
      cumulativeAvailable, cumulativeSaved,
    });
  }

  const totalProjectedIncome = months.reduce((s, m) => s + m.projected_income, 0);
  const totalProjectedExpense = months.reduce((s, m) => s + m.projected_expense, 0);
  const totalProjectedDeposit = months.reduce((s, m) => s + m.projected_deposit, 0);
  const totalProjectedAvailable = totalProjectedIncome - totalProjectedExpense - totalProjectedDeposit;

  const barData = {
    labels: months.map(m => m.label),
    datasets: [
      { label: 'Earned', data: months.map(m => m.projected_income), backgroundColor: '#2a9d8f', borderRadius: 3 },
      { label: 'Spent', data: months.map(m => m.projected_expense), backgroundColor: '#e76f51', borderRadius: 3 },
      { label: 'Saved', data: months.map(m => m.projected_deposit), backgroundColor: '#457b9d', borderRadius: 3 },
    ],
  };

  const cumBarData = {
    labels: months.map(m => m.label),
    datasets: [
      { label: 'Cumulative Available', data: months.map(m => m.cumulativeAvailable),
        backgroundColor: months.map(m => m.cumulativeAvailable >= 0 ? 'rgba(42,157,143,0.5)' : 'rgba(231,111,81,0.5)'),
        borderRadius: 3 },
      { label: 'Cumulative Saved', data: months.map(m => m.cumulativeSaved),
        backgroundColor: '#457b9d', borderRadius: 3 },
    ],
  };

  return (
    <div className="page">
      <h2>Projections</h2>
      <p className="home-subtitle">12-month forecast from {MONTH_NAMES[currentMonth]} {currentYear}</p>

      <div className="card">
        <h3>Salary Configuration</h3>
        <div className="projection-config">
          <span>Type: <strong>{salaryType}-month salary</strong></span>
          {monthlySalary > 0 && <span>Base: <strong>{monthlySalary.toFixed(0)}/mo</strong></span>}
          {monthlySalary === 0 && <span className="hint">Set salary in Settings for accurate projections</span>}
        </div>
      </div>

      <div className="stats-grid">
        <div className="card stat-card">
          <span className="stat-label">Projected Earnings</span>
          <span className="stat-value positive">{totalProjectedIncome.toFixed(0)}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Projected Spending</span>
          <span className="stat-value negative">{totalProjectedExpense.toFixed(0)}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Projected Savings</span>
          <span className="stat-value" style={{ color: '#457b9d' }}>{totalProjectedDeposit.toFixed(0)}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Projected Available</span>
          <span className={`stat-value ${totalProjectedAvailable >= 0 ? 'positive' : 'negative'}`}>
            {totalProjectedAvailable >= 0 ? '+' : ''}{totalProjectedAvailable.toFixed(0)}
          </span>
        </div>
      </div>

      <div className="card">
        <h3>Monthly Projection</h3>
        <div className="chart-container">
          <Bar data={barData}
            options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { position: 'bottom', labels: { boxWidth: 8, padding: 6, font: { size: 9 } } } },
              scales: {
                y: { beginAtZero: true, grid: { color: 'var(--grid)' } },
                x: { grid: { display: false } },
              },
            }}
          />
        </div>
      </div>

      <div className="card">
        <h3>Cumulative Outlook</h3>
        <div className="chart-container">
          <Bar data={cumBarData}
            options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { position: 'bottom', labels: { boxWidth: 8, padding: 6, font: { size: 9 } } } },
              scales: {
                y: { grid: { color: 'var(--grid)' } },
                x: { grid: { display: false } },
              },
            }}
          />
        </div>
      </div>

      <div className="card">
        <h3>Month by Month</h3>
        <div className="breakdown-list">
          {months.map((m, i) => (
            <div key={i} className="breakdown-row savings-row">
              <div>
                <span className="savings-month">{m.label}</span>
                <span className="savings-detail">
                  In: {m.projected_income.toFixed(0)} | Out: {m.projected_expense.toFixed(0)} | Save: {m.projected_deposit.toFixed(0)}
                </span>
              </div>
              <span className={`breakdown-amount ${m.projected_available >= 0 ? 'positive' : 'negative'}`}>
                {m.projected_available >= 0 ? '+' : ''}{m.projected_available.toFixed(0)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
