import { useState } from 'react';
import { Download, Upload, Trash2, Sun, Moon, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { exportToCsv, importFromCsv, clearAllData } from '../utils/db';

export default function SettingsView({ darkMode, onToggleTheme, onDataReload }) {
  const { user, signOut } = useAuth();
  const [msg, setMsg] = useState('');

  const handleExport = async () => {
    try {
      const csv = await exportToCsv();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finance_data_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setMsg('Data exported as CSV!');
    } catch { setMsg('Export failed.'); }
    setTimeout(() => setMsg(''), 2000);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          await importFromCsv(ev.target.result);
          await onDataReload();
          setMsg('CSV imported!');
        } catch (err) { setMsg('Error: ' + (err.message || 'Invalid CSV.')); }
        setTimeout(() => setMsg(''), 3000);
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleClear = async () => {
    if (confirm('Delete ALL your data (expenses, income, savings)?')) {
      try { await clearAllData(); await onDataReload(); setMsg('All data cleared.'); }
      catch { setMsg('Failed.'); }
      setTimeout(() => setMsg(''), 2000);
    }
  };

  return (
    <div className="page">
      <h2>Settings</h2>

      <div className="card">
        <h3>Account</h3>
        <p className="about-text" style={{ marginBottom: 10 }}>{user?.email}</p>
        <button className="btn-danger full-width" onClick={signOut}>
          <LogOut size={18} /> Sign Out
        </button>
      </div>

      <div className="card">
        <h3>Appearance</h3>
        <button className="btn-secondary full-width" onClick={onToggleTheme}>
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>

      <div className="card">
        <h3>Data Management</h3>
        <div className="settings-actions">
          <button className="btn-secondary" onClick={handleExport}><Download size={18} /> Export CSV</button>
          <button className="btn-secondary" onClick={handleImport}><Upload size={18} /> Import CSV</button>
          <button className="btn-danger" onClick={handleClear}><Trash2 size={18} /> Clear All Data</button>
        </div>
        {msg && <div className="success-msg">{msg}</div>}
      </div>
    </div>
  );
}
