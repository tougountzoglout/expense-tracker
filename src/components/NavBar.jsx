import { Home, LayoutDashboard, TrendingUp, Target, Settings } from 'lucide-react';

const tabs = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'projections', icon: Target, label: 'Forecast' },
  { id: 'stats', icon: TrendingUp, label: 'Stats' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export default function NavBar({ active, onNavigate }) {
  return (
    <nav className="nav-bar">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`nav-btn ${active === tab.id ? 'active' : ''}`}
          onClick={() => onNavigate(tab.id)}
        >
          <tab.icon size={18} />
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
