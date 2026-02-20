import { useState } from 'react';
import { Download, Upload, Trash2, Sun, Moon } from 'lucide-react';
import { exportData, importData, saveData } from '../utils/storage';

export default function SettingsView({ onDataChange, darkMode, onToggleTheme }) {
  const [msg, setMsg] = useState('');

  const handleExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg('Data exported!');
    setTimeout(() => setMsg(''), 2000);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = importData(ev.target.result);
          onDataChange(data);
          setMsg('Data imported successfully!');
        } catch {
          setMsg('Error: Invalid file format.');
        }
        setTimeout(() => setMsg(''), 3000);
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleClear = () => {
    if (confirm('Are you sure? This will delete ALL your data (expenses and income).')) {
      const fresh = {
        expenses: [], incomes: [],
        categories: [
          'Insurance', 'Telecom', 'Utilities', 'Childcare', 'Fitness',
          'Subscription', 'Energy', 'Building', 'Groceries', 'Food', 'Other'
        ],
        incomeCategories: ['Salary', 'Freelance', 'Investments', 'Rental', 'Bonus', 'Other'],
      };
      saveData(fresh);
      onDataChange(fresh);
      setMsg('All data cleared.');
      setTimeout(() => setMsg(''), 2000);
    }
  };

  return (
    <div className="page">
      <h2>Settings</h2>

      <div className="card">
        <h3>Appearance</h3>
        <button className="btn-secondary full-width" onClick={onToggleTheme}>
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        </button>
      </div>

      <div className="card">
        <h3>Data Management</h3>
        <div className="settings-actions">
          <button className="btn-secondary" onClick={handleExport}>
            <Download size={18} /> Export Data (JSON)
          </button>
          <button className="btn-secondary" onClick={handleImport}>
            <Upload size={18} /> Import Data (JSON)
          </button>
          <button className="btn-danger" onClick={handleClear}>
            <Trash2 size={18} /> Clear All Data
          </button>
        </div>
        {msg && <div className="success-msg">{msg}</div>}
      </div>

      <div className="card">
        <h3>About</h3>
        <p className="about-text">
          Expense Tracker PWA. All data is stored locally on your device.
          No server, no account required. Install on your home screen for the best experience.
        </p>
      </div>
    </div>
  );
}
