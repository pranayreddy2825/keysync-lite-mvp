import { Link, useLocation } from 'react-router-dom';

export default function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/whatsapp', label: 'WhatsApp', icon: '💬' },
    { path: '/gmail', label: 'Gmail', icon: '📧' },
    { path: '/backend', label: 'Backend', icon: '⚙️' },
  ];

  return (
    <header className="h-16 border-b border-gray-800 bg-[#111111] flex items-center justify-between px-6">
      <Link to="/" className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold text-lg">
          K
        </div>
        <div>
          <h1 className="text-white font-semibold text-lg">KeySync Lite</h1>
          <p className="text-gray-400 text-xs">Dubai Real Estate Lead Intelligence</p>
        </div>
      </Link>

      <nav className="flex items-center gap-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2">
        <span className="px-3 py-1 bg-gray-800/50 text-gray-300 rounded-lg text-xs border border-gray-700">
          Gemini + Qdrant
        </span>
      </div>
    </header>
  );
}

