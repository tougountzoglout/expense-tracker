import { useState, useMemo, useRef } from 'react';
import { PlusCircle, Trash2, ChevronDown, ChevronUp, List, BarChart3 } from 'lucide-react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement
} from 'chart.js';
import { getUniqueMonths, getExpensesByMonth, getIncomesByMonth, getCategoryTotals, getMonthlyTotals } from '../utils/storage';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const COLORS = [
  '#1b3a4b', '#3d6b7e', '#2a9d8f', '#e76f51', '#264653',
  '#457b9d', '#a8dadc', '#e9c46a', '#f4a261', '#8d99ae',
  '#6c757d', '#495057',
];

export default function EntryManager({
  title, entries, categories, onAdd, onDelete,
  type = 'expense', accentClass = '',
  onBack,
}) {
  const [tab, setTab] = useState('overview');
  const [showForm, setShowForm] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0] || 'Other');
  const [date, setDate] = useState(today);
  const [success, setSuccess] = useState(false);

  const chartRef = useRef(null);
  const now = new Date();

  const months = useMemo(() => getUniqueMonths(entries), [entries]);
  const [expanded, setExpanded] = useState(months[0] || '');

  const monthlyTotals = useMemo(() => {
    const all = getMonthlyTotals(entries);
    return Object.entries(all).sort((a, b) => a[0].localeCompare(b[0])).slice(-6);
  }, [entries]);

  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey);

  const getByMonth = type === 'income' ? getIncomesByMonth : getExpensesByMonth;

  const selectedEntries = useMemo(() => {
    const [y, mo] = selectedMonth.split('-');
    return getByMonth(entries, parseInt(y), parseInt(mo) - 1);
  }, [entries, selectedMonth]);

  const selectedTotal = selectedEntries.reduce((s, e) => s + e.amount, 0);
  const catTotals = useMemo(() => getCategoryTotals(selectedEntries), [selectedEntries]);
  const totalAll = entries.reduce((s, e) => s + e.amount, 0);

  const selectedLabel = useMemo(() => {
    const [y, mo] = selectedMonth.split('-');
    return new Date(y, mo - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
  }, [selectedMonth]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !amount || isNaN(parseFloat(amount))) return;
    onAdd({ name: name.trim(), amount: parseFloat(amount), category, date });
    setName(''); setAmount(''); setDate(today);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  const handleBarClick = (event) => {
    const chart = chartRef.current;
    if (!chart) return;
    const elements = chart.getElementsAtEventForMode(event.nativeEvent, 'nearest', { intersect: true }, false);
    if (elements.length > 0) {
      const key = monthlyTotals[elements[0].index][0];
      setSelectedMonth(key);
    }
  };

  const barColors = monthlyTotals.map(([key]) =>
    key === selectedMonth ? 'var(--accent)' : 'var(--chart-bar)'
  );

  const barData = {
    labels: monthlyTotals.map(([m]) => {
      const [y, mo] = m.split('-');
      return new Date(y, mo - 1).toLocaleString('default', { month: 'short', year: '2-digit' });
    }),
    datasets: [{
      data: monthlyTotals.map(([, v]) => v),
      backgroundColor: barColors,
      borderRadius: 4,
    }],
  };

  const doughnutData = {
    labels: Object.keys(catTotals),
    datasets: [{
      data: Object.values(catTotals),
      backgroundColor: COLORS.slice(0, Object.keys(catTotals).length),
      borderWidth: 0,
    }],
  };

  return (
    <div className="page">
      <div className="page-top">
        <button className="back-btn" onClick={onBack}>&#8592; Home</button>
        <h2>{title}</h2>
      </div>

      {/* Sub-tabs */}
      <div className="sub-tabs">
        <button className={`sub-tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>
          <BarChart3 size={14} /> Overview
        </button>
        <button className={`sub-tab ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>
          <List size={14} /> History
        </button>
        <button className={`sub-tab ${tab === 'add' ? 'active' : ''}`} onClick={() => setTab('add')}>
          <PlusCircle size={14} /> Add
        </button>
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <>
          <div className={`card total-card ${accentClass}`}>
            <span className="total-label">{selectedLabel}</span>
            <span className="total-amount">{selectedTotal.toFixed(2)}</span>
            <span className="total-count">{selectedEntries.length} entries | {totalAll.toFixed(2)} all time</span>
          </div>

          {monthlyTotals.length > 1 && (
            <div className="card">
              <h3>Monthly Trend <span className="hint">(tap bar to select)</span></h3>
              <div className="chart-container-sm">
                <Bar ref={chartRef} data={barData}
                  options={{
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
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

          {Object.keys(catTotals).length > 0 && (
            <div className="card">
              <h3>By Category</h3>
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
            <h3>Breakdown</h3>
            <div className="breakdown-list">
              {Object.entries(catTotals).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => (
                <div key={cat} className="breakdown-row">
                  <span>{cat}</span>
                  <span className={`breakdown-amount ${accentClass}`}>{amt.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* History Tab */}
      {tab === 'history' && (
        <>
          {months.length === 0 && <p className="empty">No entries yet.</p>}
          {months.map(m => {
            const [y, mo] = m.split('-');
            const items = getByMonth(entries, parseInt(y), parseInt(mo) - 1);
            const total = items.reduce((s, e) => s + e.amount, 0);
            const label = new Date(y, mo - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
            const isOpen = expanded === m;
            return (
              <div key={m} className="card history-card">
                <button className="history-header" onClick={() => setExpanded(isOpen ? '' : m)}>
                  <div>
                    <span className="history-month">{label}</span>
                    <span className={`history-total ${accentClass}`}>{total.toFixed(2)}</span>
                  </div>
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {isOpen && (
                  <div className="history-items">
                    {items.sort((a, b) => b.amount - a.amount).map(e => (
                      <div key={e.id} className="history-item">
                        <div className="history-item-info">
                          <span className="history-item-name">{e.name}</span>
                          <span className="history-item-cat">{e.category}</span>
                        </div>
                        <div className="history-item-right">
                          <span className={`history-item-amount ${accentClass}`}>{e.amount.toFixed(2)}</span>
                          <button className="btn-delete" onClick={() => onDelete(e.id)}><Trash2 size={15} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}

      {/* Add Tab */}
      {tab === 'add' && (
        <form className="card expense-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{type === 'income' ? 'Source' : 'Name'}</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder={type === 'income' ? 'e.g. Monthly Salary' : 'e.g. Vodafone'} required />
          </div>
          <div className="form-group">
            <label>Amount (EUR)</label>
            <input type="number" step="0.01" min="0" value={amount}
              onChange={e => setAmount(e.target.value)} placeholder="0.00" required />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary">
            <PlusCircle size={18} /> {type === 'income' ? 'Add Income' : 'Add Expense'}
          </button>
          {success && <div className="success-msg">Added successfully!</div>}
        </form>
      )}
    </div>
  );
}
