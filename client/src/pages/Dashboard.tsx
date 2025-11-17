import { Link } from 'react-router-dom';
import { useState } from 'react';
import RecentLeadsList from '../components/RecentLeadsList';
import { FaWhatsapp, FaEnvelope, FaChartLine, FaClock, FaUserCheck, FaExclamationTriangle } from 'react-icons/fa';

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [selectedTeam, setSelectedTeam] = useState<'all' | 'luxury' | 'off-plan' | 'rental'>('all');

  return (
    <div className="h-full bg-[#0a0a0a] text-white overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6">
        {/* Hero Section with Filters */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">KeySync Lite</h1>
              <p className="text-gray-400 text-lg">Dubai Real Estate Lead Intelligence Platform</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-4 py-2 bg-[#111111] border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="all">All Time</option>
              </select>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value as any)}
                className="px-4 py-2 bg-[#111111] border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                <option value="all">All Teams</option>
                <option value="luxury">Luxury</option>
                <option value="off-plan">Off-Plan</option>
                <option value="rental">Rental</option>
              </select>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#111111] border border-gray-800 rounded-xl p-6 hover:border-amber-500/30 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="text-gray-400 text-sm">Total Leads</div>
              <FaChartLine className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">1,247</div>
            <div className="text-emerald-400 text-sm">+12% vs last month</div>
          </div>
          <div className="bg-[#111111] border border-gray-800 rounded-xl p-6 hover:border-amber-500/30 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="text-gray-400 text-sm">AI Automation</div>
              <FaUserCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">87%</div>
            <div className="text-emerald-400 text-sm">1,084 leads auto-handled</div>
          </div>
          <div className="bg-[#111111] border border-gray-800 rounded-xl p-6 hover:border-amber-500/30 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="text-gray-400 text-sm">Avg Response</div>
              <FaClock className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">0.6s</div>
            <div className="text-emerald-400 text-sm">Sub-second responses</div>
          </div>
          <div className="bg-[#111111] border border-gray-800 rounded-xl p-6 hover:border-amber-500/30 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="text-gray-400 text-sm">High Priority</div>
              <FaExclamationTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">163</div>
            <div className="text-red-400 text-sm">Requires attention</div>
          </div>
        </div>

        {/* Channel Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#111111] border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <FaWhatsapp className="w-6 h-6" style={{ color: '#25D366' }} />
              <div>
                <div className="text-gray-400 text-sm">WhatsApp Leads</div>
                <div className="text-2xl font-bold text-white">892</div>
              </div>
            </div>
            <div className="text-emerald-400 text-sm">71% of total leads</div>
          </div>
          <div className="bg-[#111111] border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <FaEnvelope className="w-6 h-6" style={{ color: '#EA4335' }} />
              <div>
                <div className="text-gray-400 text-sm">Email Leads</div>
                <div className="text-2xl font-bold text-white">298</div>
              </div>
            </div>
            <div className="text-emerald-400 text-sm">24% of total leads</div>
          </div>
          <div className="bg-[#111111] border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <FaChartLine className="w-6 h-6 text-gray-400" />
              <div>
                <div className="text-gray-400 text-sm">Portal Leads</div>
                <div className="text-2xl font-bold text-white">57</div>
              </div>
            </div>
            <div className="text-emerald-400 text-sm">5% of total leads</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Leads List - Takes 2 columns */}
          <div className="lg:col-span-2">
            <RecentLeadsList
              onLeadSelect={(lead) => {
                // Navigate to appropriate channel based on lead
                const channel = lead.channel === 'email' ? 'gmail' : lead.channel;
                window.location.href = `/${channel}`;
              }}
            />
          </div>

          {/* Quick Actions - Takes 1 column */}
          <div className="space-y-6">
            {/* Demo Cards */}
            <div className="space-y-4">
          <Link
            to="/whatsapp"
            className="bg-[#111111] border border-gray-800 rounded-xl p-6 hover:border-amber-500/50 transition-all group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-2xl">
                💬
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white group-hover:text-amber-400 transition-colors">
                  WhatsApp Demo
                </h3>
                <p className="text-gray-400 text-sm">Test lead processing via WhatsApp interface</p>
              </div>
            </div>
            <p className="text-gray-500 text-sm">
              Experience how KeySync handles incoming WhatsApp messages, analyzes leads, and generates AI-powered responses.
            </p>
          </Link>

          <Link
            to="/gmail"
            className="bg-[#111111] border border-gray-800 rounded-xl p-6 hover:border-amber-500/50 transition-all group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-2xl">
                📧
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white group-hover:text-amber-400 transition-colors">
                  Gmail Demo
                </h3>
                <p className="text-gray-400 text-sm">See automatic email replies in action</p>
              </div>
            </div>
            <p className="text-gray-500 text-sm">
              Watch how KeySync automatically processes email inquiries and sends personalized responses via Gmail.
            </p>
          </Link>

          <Link
            to="/backend"
            className="bg-[#111111] border border-gray-800 rounded-xl p-6 hover:border-amber-500/50 transition-all group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-2xl">
                ⚙️
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white group-hover:text-amber-400 transition-colors">
                  Backend Process
                </h3>
                <p className="text-gray-400 text-sm">Monitor real-time lead processing pipeline</p>
              </div>
            </div>
            <p className="text-gray-500 text-sm">
              Visualize the complete backend workflow: AI analysis, Qdrant retrieval, persona assignment, and response generation.
            </p>
          </Link>

            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-[#111111] border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Powered By</h3>
          <div className="flex flex-wrap gap-3">
            <span className="px-3 py-1 bg-gray-800/50 text-gray-300 rounded-lg text-sm border border-gray-700">
              Google Gemini 2.0
            </span>
            <span className="px-3 py-1 bg-gray-800/50 text-gray-300 rounded-lg text-sm border border-gray-700">
              Qdrant Vector DB
            </span>
            <span className="px-3 py-1 bg-gray-800/50 text-gray-300 rounded-lg text-sm border border-gray-700">
              Node.js + Express
            </span>
            <span className="px-3 py-1 bg-gray-800/50 text-gray-300 rounded-lg text-sm border border-gray-700">
              React + TypeScript
            </span>
            <span className="px-3 py-1 bg-gray-800/50 text-gray-300 rounded-lg text-sm border border-gray-700">
              Tailwind CSS
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

