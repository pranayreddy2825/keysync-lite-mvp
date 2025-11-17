import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaWhatsapp, FaEnvelope, FaCog, FaChartLine, FaBars, FaTimes } from 'react-icons/fa';
import { useState } from 'react';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: FaChartLine },
    { path: '/whatsapp', label: 'WhatsApp', icon: FaWhatsapp, color: '#25D366' },
    { path: '/gmail', label: 'Gmail', icon: FaEnvelope, color: '#EA4335' },
    { path: '/backend', label: 'AI Pipeline', icon: FaCog },
  ];

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-[#111111] border-r border-gray-800 flex flex-col transition-all duration-300`}
      >
        {/* Logo */}
        <div className="h-16 border-b border-gray-800 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              K
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-white font-semibold text-sm">KeySync Lite</h1>
                <p className="text-gray-400 text-xs">Lead Intelligence</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            {sidebarOpen ? <FaTimes className="w-4 h-4" /> : <FaBars className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" style={item.color ? { color: item.color } : {}} />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        {sidebarOpen && (
          <div className="p-4 border-t border-gray-800">
            <div className="px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="text-xs text-gray-400 mb-1">Powered by</div>
              <div className="text-xs text-gray-300">Gemini + Qdrant</div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 border-b border-gray-800 bg-[#111111] flex items-center justify-between px-6">
          <div>
            <h2 className="text-white font-semibold text-lg">
              {location.pathname === '/' && 'Dashboard'}
              {location.pathname === '/whatsapp' && 'WhatsApp Lead Triage'}
              {location.pathname === '/gmail' && 'Gmail Lead Triage'}
              {location.pathname === '/backend' && 'AI Pipeline Monitor'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-gray-800/50 text-gray-300 rounded-lg text-xs border border-gray-700">
              Live
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-semibold text-sm">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}

