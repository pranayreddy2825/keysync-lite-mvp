import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaWhatsapp, FaEnvelope, FaCog, FaChartLine, FaBars, FaTimes, FaRocket } from 'react-icons/fa';
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
    { path: '/vision', label: 'Future Vision', icon: FaRocket },
  ];

  return (
    <div className="flex h-screen bg-[#0f172a] text-white">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-[#1e293b] border-r border-gray-700/50 flex flex-col transition-all duration-300`}
      >
        {/* Logo */}
        <div className="h-16 border-b border-gray-700/50 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
              {/* Modern logo design */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20"></div>
              <svg className="w-6 h-6 text-white relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
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
            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
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
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
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
          <div className="p-4 border-t border-gray-700/50">
            <div className="px-4 py-2 bg-gray-700/30 rounded-lg border border-gray-600/50">
              <div className="text-xs text-gray-400 mb-1">Powered by</div>
              <div className="text-xs text-gray-300">Gemini + Qdrant</div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar - Template Style */}
        <header className="h-16 border-b border-gray-700/30 bg-[#0f172a] flex items-center justify-between px-6">
          <div>
            <h2 className="text-white font-bold text-xl tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              {location.pathname === '/' && 'Dashboard'}
              {location.pathname === '/whatsapp' && 'WhatsApp Lead Triage'}
              {location.pathname === '/gmail' && 'Gmail Lead Triage'}
              {location.pathname === '/backend' && 'AI Pipeline Monitor'}
              {location.pathname === '/vision' && 'Future Vision'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-1.5 bg-transparent border border-gray-600/50 text-white rounded-full text-xs font-medium">
              Live
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-pink-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg">
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

