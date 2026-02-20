import { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import NavBar from './components/NavBar';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import Averages from './components/Averages';
import EntryManager from './components/EntryManager';
import SavingsView from './components/SavingsView';
import SettingsView from './components/SettingsView';
import LoginScreen from './components/LoginScreen';
import { fetchExpenses, fetchIncomes, insertExpense, insertIncome, removeExpense, removeIncome } from './utils/db';

const CATEGORIES = [
  'Insurance', 'Telecom', 'Utilities', 'Childcare', 'Fitness',
  'Subscription', 'Energy', 'Building', 'Groceries', 'Food', 'Other'
];
const INCOME_CATEGORIES = [
  'Salary', 'Freelance', 'Investments', 'Rental', 'Bonus', 'Other'
];

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const [page, setPage] = useState('home');
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('expense_tracker_theme');
    return saved === 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('expense_tracker_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const loadAll = useCallback(async () => {
    if (!user) return;
    setDataLoading(true);
    try {
      const [exp, inc] = await Promise.all([fetchExpenses(), fetchIncomes()]);
      setExpenses(exp);
      setIncomes(inc);
    } catch (err) {
      console.error('Failed to load data:', err.message);
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) loadAll();
  }, [user, loadAll]);

  if (authLoading) {
    return <div className="loading-screen"><div className="spinner" /><p>Loading...</p></div>;
  }

  if (!user) {
    return <LoginScreen />;
  }

  if (dataLoading) {
    return <div className="loading-screen"><div className="spinner" /><p>Loading your data...</p></div>;
  }

  const handleAddExpense = async (e) => { await insertExpense(e); await loadAll(); };
  const handleDeleteExpense = async (id) => { await removeExpense(id); await loadAll(); };
  const handleAddIncome = async (i) => { await insertIncome(i); await loadAll(); };
  const handleDeleteIncome = async (id) => { await removeIncome(id); await loadAll(); };

  const navTab = ['home', 'dashboard', 'stats', 'settings'].includes(page) ? page : 'home';

  return (
    <div className="app">
      <header className="app-header">
        <h1>Finance Tracker</h1>
      </header>

      <main className="app-main">
        {page === 'home' && (
          <Home expenses={expenses} incomes={incomes} onNavigate={setPage} />
        )}
        {page === 'expenses' && (
          <EntryManager
            title="Expenses" entries={expenses} categories={CATEGORIES}
            onAdd={handleAddExpense} onDelete={handleDeleteExpense}
            type="expense" onBack={() => setPage('home')}
          />
        )}
        {page === 'income' && (
          <EntryManager
            title="Income" entries={incomes} categories={INCOME_CATEGORIES}
            onAdd={handleAddIncome} onDelete={handleDeleteIncome}
            type="income" accentClass="income-amount" onBack={() => setPage('home')}
          />
        )}
        {page === 'savings' && (
          <SavingsView expenses={expenses} incomes={incomes} onBack={() => setPage('home')} />
        )}
        {page === 'dashboard' && (
          <Dashboard expenses={expenses} incomes={incomes} />
        )}
        {page === 'stats' && (
          <Averages expenses={expenses} incomes={incomes} />
        )}
        {page === 'settings' && (
          <SettingsView
            darkMode={darkMode}
            onToggleTheme={() => setDarkMode(!darkMode)}
            onDataReload={loadAll}
          />
        )}
      </main>

      <NavBar active={navTab} onNavigate={setPage} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
