import { useMemo, useRef, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement
} from 'chart.js';
import { getMonthlyTotals, getMonthlySavings, getCategoryTotals, getExpensesByMonth, getIncomesByMonth } from '../utils/storage';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const COLORS = [
  '#1b3a4b', '#3d6b7e', '#2a9d8f', '#e76f51', '#264653',
  '#457b9d', '#a8dadc', '#e9c46a', '#f4a261', '#8d99ae',
  '#6c757d', '#495057',
];

export default function Dashboard({ expenses, incomes }) {
  const now = new Date();
  const chartRef = useRef(null);

  const expTotals = useMemo(() => getMonthlyTotals(expenses), [expenses]);
  const incTotals = useMemo(() => getMonthlyTotals(incomes), [incomes]);
  const savings = useMemo(() => getMonthlySavings(expenses, incomes), [expenses, incomes]);

  const allKeys = useMemo(() => {
    const set = new Set([...Object.keys(expTotals), ...Object.keys(incTotals)]);
    return Array.from(set).sort().slice(-6);
  }, [expTotals, incTotals]);

  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey);

  const selectedLabel = useMemo(() => {
    const [y, mo] = selectedMonth.split('-');
    return new Date(y, mo - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
  }, [selectedMonth]);

  const selExp = expTotals[selectedMonth] || 0;
  const selInc = incTotals[selectedMonth] || 0;
  const selSav = (savings[selectedMonth] || 0);

  const selExpEntries = useMemo(() => {
    const [y, mo] = selectedMonth.split('-');
    return getExpensesByMonth(expenses, parseInt(y), parseInt(mo) - 1);
  }, [expenses, selectedMonth]);

  const expCatTotals = useMemo(() => getCategoryTotals(selExpEntries), [selExpEntries]);

  const labels = allKeys.map(m => {
    const [y, mo] = m.split('-');
    return new Date(y, mo - 1).toLocaleString('default', { month: 'short', year: '2-digit' });
  });

  const groupedBarData = {
    labels,
    datasets: [
      { label: 'Income', data: allKeys.map(k => incTotals[k] || 0), backgroundColor: '#2a9d8f', borderRadius: 4 },
      { label: 'Expenses', data: allKeys.map(k => expTotals[k] || 0), backgroundColor: '#e76f51', borderRadius: 4 },
    ],
  };

  const handleBarClick = (event) => {
    const chart = chartRef.current;
    if (!chart) return;
    const elements = chart.getElementsAtEventForMode(event.nativeEvent, 'nearest', { intersect: true }, false);
    if (elements.length > 0) {
      setSelectedMonth(allKeys[elements[0].index]);
    }
  };

  const doughnutData = {
    labels: Object.keys(expCatTotals),
    datasets: [{
      data: Object.values(expCatTotals),
      backgroundColor: COLORS.slice(0, Object.keys(expCatTotals).length),
      borderWidth: 0,
    }],
  };

  return (
    <div className="page">
      <h2>Dashboard</h2>

      {/* Income vs Expenses bar chart */}
      {allKeys.length > 0 && (
        <div className="card">
          <h3>Income vs Expenses <span className="hint">(tap bar to select month)</span></h3>
          <div className="chart-container">
            <Bar ref={chartRef} data={groupedBarData}
              options={{
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 8, font: { size: 10 } } } },
                scales: {
                  y: { beginAtZero: true, grid: { color: 'var(--grid)' } },
                  x: { grid: { display: false } },
                },
              }}
              onClick={handleBarClick}
            />
          </div>
        </div>
      )}

      {/* Selected month summary */}
      <div className="card">
        <h3>{selectedLabel}</h3>
        <div className="dash-summary-row">
          <div className="dash-summary-item">
            <span className="dash-summary-label">Income</span>
            <span className="dash-summary-value positive">{selInc.toFixed(2)}</span>
          </div>
          <div className="dash-summary-item">
            <span className="dash-summary-label">Expenses</span>
            <span className="dash-summary-value negative">{selExp.toFixed(2)}</span>
          </div>
          <div className="dash-summary-item">
            <span className="dash-summary-label">Balance</span>
            <span className={`dash-summary-value ${selSav >= 0 ? 'positive' : 'negative'}`}>
              {selSav >= 0 ? '+' : ''}{selSav.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Expense categories for selected month */}
      {Object.keys(expCatTotals).length > 0 && (
        <div className="card">
          <h3>Expense Categories</h3>
          <div className="chart-container-sm">
            <Doughnut data={doughnutData}
              options={{
                responsive: true, maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom', labels: { boxWidth: 10, padding: 6, font: { size: 10 } } },
                  tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed.toFixed(2)}` } }
                },
              }}
            />
          </div>
        </div>
      )}

      <div className="card">
        <h3>Expense Breakdown</h3>
        <div className="breakdown-list">
          {Object.entries(expCatTotals).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => (
            <div key={cat} className="breakdown-row">
              <span>{cat}</span>
              <span className="breakdown-amount">{amt.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
