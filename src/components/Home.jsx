import { useMemo, useState, useRef } from 'react';
import { Receipt, DollarSign, PiggyBank, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend
} from 'chart.js';
import { getMonthlyTotals, getMonthlyAvailable } from '../utils/storage';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Home({ expenses, incomes, deposits, onNavigate }) {
  const now = new Date();
  const chartRef = useRef(null);

  const expTotals = useMemo(() => getMonthlyTotals(expenses), [expenses]);
  const incTotals = useMemo(() => getMonthlyTotals(incomes), [incomes]);
  const depTotals = useMemo(() => getMonthlyTotals(deposits), [deposits]);
  const available = useMemo(() => getMonthlyAvailable(expenses, incomes, deposits), [expenses, incomes, deposits]);

  const last3 = useMemo(() => {
    const keys = [];
    for (let i = 0; i < 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
    return keys.reverse();
  }, []);

  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey);

  const selInc = incTotals[selectedMonth] || 0;
  const selExp = expTotals[selectedMonth] || 0;
  const selDep = depTotals[selectedMonth] || 0;
  const selAvail = available[selectedMonth] || 0;

  const selectedLabel = useMemo(() => {
    const [y, mo] = selectedMonth.split('-');
    return new Date(y, mo - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
  }, [selectedMonth]);

  const last3Labels = last3.map(m => {
    const [y, mo] = m.split('-');
    return new Date(y, mo - 1).toLocaleString('default', { month: 'short', year: '2-digit' });
  });

  const barData = {
    labels: last3Labels,
    datasets: [
      { label: 'Earned', data: last3.map(k => incTotals[k] || 0), backgroundColor: '#2a9d8f', borderRadius: 4 },
      { label: 'Spent', data: last3.map(k => expTotals[k] || 0), backgroundColor: '#e76f51', borderRadius: 4 },
      { label: 'Saved', data: last3.map(k => depTotals[k] || 0), backgroundColor: '#457b9d', borderRadius: 4 },
      { label: 'Available', data: last3.map(k => available[k] || 0),
        backgroundColor: last3.map(k => (available[k] || 0) >= 0 ? 'rgba(42,157,143,0.35)' : 'rgba(231,111,81,0.35)'),
        borderRadius: 4 },
    ],
  };

  const handleBarClick = (event) => {
    const chart = chartRef.current;
    if (!chart) return;
    const elements = chart.getElementsAtEventForMode(event.nativeEvent, 'nearest', { intersect: true }, false);
    if (elements.length > 0) {
      setSelectedMonth(last3[elements[0].index]);
    }
  };

  return (
    <div className="page">
      <h2>Overview</h2>
      <p className="home-subtitle">{selectedLabel}</p>

      <div className="home-summary home-summary-4">
        <div className="summary-item">
          <span className="summary-label">Earned</span>
          <span className="summary-value positive">{selInc.toFixed(0)}</span>
        </div>
        <div className="summary-divider" />
        <div className="summary-item">
          <span className="summary-label">Spent</span>
          <span className="summary-value negative">{selExp.toFixed(0)}</span>
        </div>
        <div className="summary-divider" />
        <div className="summary-item">
          <span className="summary-label">Saved</span>
          <span className="summary-value" style={{ color: '#457b9d' }}>{selDep.toFixed(0)}</span>
        </div>
        <div className="summary-divider" />
        <div className="summary-item">
          <span className="summary-label">Available</span>
          <span className={`summary-value ${selAvail >= 0 ? 'positive' : 'negative'}`}>
            {selAvail >= 0 ? '+' : ''}{selAvail.toFixed(0)}
          </span>
        </div>
      </div>

      <div className="card">
        <h3>Last 3 Months <span className="hint">(tap bar to select)</span></h3>
        <div className="chart-container-sm">
          <Bar ref={chartRef} data={barData}
            options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { position: 'bottom', labels: { boxWidth: 8, padding: 6, font: { size: 9 } } } },
              scales: {
                y: { beginAtZero: true, grid: { color: 'var(--grid)' } },
                x: { grid: { display: false } },
              },
            }}
            onClick={handleBarClick}
          />
        </div>
      </div>

      <div className="home-cards">
        <button className="home-card home-card-income" onClick={() => onNavigate('income')}>
          <div className="home-card-icon"><DollarSign size={26} /></div>
          <div className="home-card-body">
            <span className="home-card-title">Income</span>
            <span className="home-card-desc">Record your earnings</span>
          </div>
          <div className="home-card-amount income-amount">
            <TrendingUp size={14} /><span>{selInc.toFixed(0)}</span>
          </div>
        </button>

        <button className="home-card home-card-expense" onClick={() => onNavigate('expenses')}>
          <div className="home-card-icon"><Receipt size={26} /></div>
          <div className="home-card-body">
            <span className="home-card-title">Expenses</span>
            <span className="home-card-desc">Track your spending</span>
          </div>
          <div className="home-card-amount">
            <TrendingDown size={14} /><span>{selExp.toFixed(0)}</span>
          </div>
        </button>

        <button className="home-card home-card-deposit" onClick={() => onNavigate('deposits')}>
          <div className="home-card-icon"><PiggyBank size={26} /></div>
          <div className="home-card-body">
            <span className="home-card-title">Savings Account</span>
            <span className="home-card-desc">Money set aside</span>
          </div>
          <div className="home-card-amount" style={{ color: '#457b9d' }}>
            <PiggyBank size={14} /><span>{selDep.toFixed(0)}</span>
          </div>
        </button>

        <button className="home-card home-card-available" onClick={() => onNavigate('dashboard')}>
          <div className="home-card-icon"><Wallet size={26} /></div>
          <div className="home-card-body">
            <span className="home-card-title">Available</span>
            <span className="home-card-desc">Earned - Spent - Saved</span>
          </div>
          <div className={`home-card-amount ${selAvail >= 0 ? 'positive' : 'negative'}`}>
            <Wallet size={14} /><span>{selAvail >= 0 ? '+' : ''}{selAvail.toFixed(0)}</span>
          </div>
        </button>
      </div>
    </div>
  );
}
