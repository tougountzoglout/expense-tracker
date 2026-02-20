import { useState, useEffect } from 'react';
import NavBar from './components/NavBar';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import Averages from './components/Averages';
import EntryManager from './components/EntryManager';
import SavingsView from './components/SavingsView';
import SettingsView from './components/SettingsView';
import { loadData, addExpense, deleteExpense, addIncome, deleteIncome } from './utils/storage';
import { seedIfEmpty } from './utils/seed';

export default function App() {
  const [page, setPage] = useState('home');
  const [data, setData] = useState(() => seedIfEmpty());
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('expense_tracker_theme');
    return saved === 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('expense_tracker_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const refresh = () => setData(loadData());

  const handleAddExpense = (e) => { addExpense(e); refresh(); };
  const handleDeleteExpense = (id) => { deleteExpense(id); refresh(); };
  const handleAddIncome = (i) => { addIncome(i); refresh(); };
  const handleDeleteIncome = (id) => { deleteIncome(id); refresh(); };

  const navTab = ['home', 'dashboard', 'stats', 'settings'].includes(page) ? page : 'home';

  return (
    <div className="app">
      <header className="app-header">
        <h1>Finance Tracker</h1>
      </header>

      <main className="app-main">
        {page === 'home' && (
          <Home expenses={data.expenses} incomes={data.incomes} onNavigate={setPage} />
        )}

        {page === 'expenses' && (
          <EntryManager
            title="Expenses"
            entries={data.expenses}
            categories={data.categories}
            onAdd={handleAddExpense}
            onDelete={handleDeleteExpense}
            type="expense"
            onBack={() => setPage('home')}
          />
        )}

        {page === 'income' && (
          <EntryManager
            title="Income"
            entries={data.incomes}
            categories={data.incomeCategories}
            onAdd={handleAddIncome}
            onDelete={handleDeleteIncome}
            type="income"
            accentClass="income-amount"
            onBack={() => setPage('home')}
          />
        )}

        {page === 'savings' && (
          <SavingsView
            expenses={data.expenses}
            incomes={data.incomes}
            onBack={() => setPage('home')}
          />
        )}

        {page === 'dashboard' && (
          <Dashboard expenses={data.expenses} incomes={data.incomes} />
        )}

        {page === 'stats' && (
          <Averages expenses={data.expenses} incomes={data.incomes} />
        )}

        {page === 'settings' && (
          <SettingsView
            onDataChange={setData}
            darkMode={darkMode}
            onToggleTheme={() => setDarkMode(!darkMode)}
          />
        )}
      </main>

      <NavBar active={navTab} onNavigate={setPage} />
    </div>
  );
}
