import { useMemo } from 'react';
import { Receipt, DollarSign, PiggyBank, TrendingUp, TrendingDown } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend
} from 'chart.js';
import { getMonthlyTotals, getMonthlySavings } from '../utils/storage';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Home({ expenses, incomes, onNavigate }) {
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthLabel = now.toLocaleString('default', { month: 'long', year: 'numeric' });

  const expTotals = useMemo(() => getMonthlyTotals(expenses), [expenses]);
  const incTotals = useMemo(() => getMonthlyTotals(incomes), [incomes]);
  const savings = useMemo(() => getMonthlySavings(expenses, incomes), [expenses, incomes]);

  const curExpense = expTotals[monthKey] || 0;
  const curIncome = incTotals[monthKey] || 0;
  const curSavings = savings[monthKey] || 0;

  // Last 3 months keys
  const last3 = useMemo(() => {
    const keys = [];
    for (let i = 0; i < 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
    return keys.reverse();
  }, []);

  const last3Labels = last3.map(m => {
    const [y, mo] = m.split('-');
    return new Date(y, mo - 1).toLocaleString('default', { month: 'short', year: '2-digit' });
  });

  const barData = {
    labels: last3Labels,
    datasets: [
      { label: 'Income', data: last3.map(k => incTotals[k] || 0), backgroundColor: '#2a9d8f', borderRadius: 4 },
      { label: 'Expenses', data: last3.map(k => expTotals[k] || 0), backgroundColor: '#e76f51', borderRadius: 4 },
      { label: 'Balance', data: last3.map(k => savings[k] || 0),
        backgroundColor: last3.map(k => (savings[k] || 0) >= 0 ? 'rgba(42,157,143,0.35)' : 'rgba(231,111,81,0.35)'),
        borderRadius: 4 },
    ],
  };

  return (
    <div className="page">
      <h2>Overview</h2>
      <p className="home-subtitle">{monthLabel}</p>

      {/* Summary row */}
      <div className="home-summary">
        <div className="summary-item">
          <span className="summary-label">Income</span>
          <span className="summary-value positive">{curIncome.toFixed(0)}</span>
        </div>
        <div className="summary-divider" />
        <div className="summary-item">
          <span className="summary-label">Expenses</span>
          <span className="summary-value negative">{curExpense.toFixed(0)}</span>
        </div>
        <div className="summary-divider" />
        <div className="summary-item">
          <span className="summary-label">Balance</span>
          <span className={`summary-value ${curSavings >= 0 ? 'positive' : 'negative'}`}>
            {curSavings >= 0 ? '+' : ''}{curSavings.toFixed(0)}
          </span>
        </div>
      </div>

      {/* Last 3 months chart */}
      <div className="card">
        <h3>Last 3 Months</h3>
        <div className="chart-container-sm">
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

      {/* Navigation cards */}
      <div className="home-cards">
        <button className="home-card home-card-expense" onClick={() => onNavigate('expenses')}>
          <div className="home-card-icon"><Receipt size={28} /></div>
          <div className="home-card-body">
            <span className="home-card-title">Expenses</span>
            <span className="home-card-desc">Track & manage your spending</span>
          </div>
          <div className="home-card-amount">
            <TrendingDown size={14} />
            <span>{curExpense.toFixed(0)}</span>
          </div>
        </button>

        <button className="home-card home-card-income" onClick={() => onNavigate('income')}>
          <div className="home-card-icon"><DollarSign size={28} /></div>
          <div className="home-card-body">
            <span className="home-card-title">Income</span>
            <span className="home-card-desc">Record your earnings</span>
          </div>
          <div className="home-card-amount income-amount">
            <TrendingUp size={14} />
            <span>{curIncome.toFixed(0)}</span>
          </div>
        </button>

        <button className="home-card home-card-savings" onClick={() => onNavigate('savings')}>
          <div className="home-card-icon"><PiggyBank size={28} /></div>
          <div className="home-card-body">
            <span className="home-card-title">Savings</span>
            <span className="home-card-desc">Monitor your money keeping</span>
          </div>
          <div className={`home-card-amount ${curSavings >= 0 ? 'positive' : 'negative'}`}>
            <PiggyBank size={14} />
            <span>{curSavings >= 0 ? '+' : ''}{curSavings.toFixed(0)}</span>
          </div>
        </button>
      </div>
    </div>
  );
}
