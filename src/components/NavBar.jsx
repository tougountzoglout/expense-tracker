import { Home, LayoutDashboard, TrendingUp, Settings } from 'lucide-react';

const tabs = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
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
          <tab.icon size={20} />
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
