import { Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import RecentLeadsList from '../components/RecentLeadsList';
import { 
  FaWhatsapp, FaEnvelope, FaChartLine, FaClock, FaUserCheck, FaExclamationTriangle, 
  FaArrowUp, FaArrowDown, FaSearch, FaCheckCircle, FaSpinner
} from 'react-icons/fa';
import { demoLeads, filterLeadsByTimeRange, filterLeadsByTeam, calculateStats } from '../data/demoLeads';

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [selectedTeam, setSelectedTeam] = useState<'all' | 'luxury' | 'off-plan' | 'rental'>('all');

  // Filter leads based on time range and team
  const filteredLeadsForStats = useMemo(() => {
    let leads = filterLeadsByTimeRange(demoLeads, timeRange);
    leads = filterLeadsByTeam(leads, selectedTeam);
    return leads;
  }, [timeRange, selectedTeam]);

  // Convert to format expected by RecentLeadsList (remove team field)
  const filteredLeads = useMemo(() => {
    return filteredLeadsForStats.map(({ team, ...lead }) => lead);
  }, [filteredLeadsForStats]);

  // Calculate stats from filtered leads (before removing team field)
  const stats = useMemo(() => calculateStats(filteredLeadsForStats), [filteredLeadsForStats]);

  // Calculate percentage changes (mock data for trends)
  const percentageChanges = {
    totalLeads: 12.5,
    aiAutomation: 5.2,
    responseTime: -8.3,
    highPriority: -15.7,
  };

  // Get current date
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <div className="h-full bg-[#0f172a] text-white overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6">
        {/* Modern SaaS Header Section - Template Style */}
        <div className="mb-8">
          {/* Top Navigation Bar */}
          <div className="flex items-center justify-between mb-6">
            {/* Logo Section - Real Estate Firm */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div>
                <div className="text-white font-semibold text-lg tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  Dubai Properties
                </div>
                <div className="text-gray-400 text-xs font-medium">
                  Real Estate Intelligence
                </div>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Search Icon */}
              <button className="w-10 h-10 rounded-full bg-[#1e293b] border border-gray-700/50 flex items-center justify-center hover:bg-[#1e293b]/80 transition-colors">
                <FaSearch className="w-4 h-4 text-gray-400" />
              </button>
              
              {/* Date Display */}
              <div className="px-4 py-2 bg-[#1e293b] border border-gray-700/50 rounded-full text-gray-300 text-sm font-medium">
                {currentDate}
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 bg-[#1e293b] border border-gray-700/50 rounded-full px-1 py-1">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as any)}
                  className="appearance-none pl-3 pr-6 py-1.5 bg-transparent border-none text-white text-sm focus:outline-none cursor-pointer font-medium"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="all">All Time</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2 bg-[#1e293b] border border-gray-700/50 rounded-full px-1 py-1">
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value as any)}
                  className="appearance-none pl-3 pr-6 py-1.5 bg-transparent border-none text-white text-sm focus:outline-none cursor-pointer font-medium"
                >
                  <option value="all">All Teams</option>
                  <option value="luxury">Luxury</option>
                  <option value="off-plan">Off-Plan</option>
                  <option value="rental">Rental</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main Header Section */}
          <div className="flex items-center justify-between mb-6">
            {/* Dashboard Title */}
            <div>
              <h1 className="text-4xl font-bold text-white mb-1 tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 700 }}>
                Lead Dashboard
              </h1>
              <p className="text-gray-400 text-sm font-medium">
                Real-time intelligence and analytics for your property leads
              </p>
            </div>

            {/* Action Button */}
            <button className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white text-sm font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2">
              <span>Export Report</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Enhanced Stats Grid - Template Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Leads Card */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-600 text-sm font-medium">Total Leads</div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <FaChartLine className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">{stats.totalLeads.toLocaleString()}</div>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-full">
                <FaArrowUp className="w-3 h-3 text-green-600" />
                <span className="text-green-600 text-sm font-semibold">{percentageChanges.totalLeads}%</span>
              </div>
            </div>
            <p className="text-gray-500 text-xs">This period vs last</p>
          </div>

          {/* AI Automation Card */}
          <div className="bg-[#1e293b] rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-400 text-sm font-medium">AI Automation</div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform">
                <FaUserCheck className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-4xl font-bold text-white mb-2">87%</div>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-full border border-green-500/30">
                <FaArrowUp className="w-3 h-3 text-green-400" />
                <span className="text-green-400 text-sm font-semibold">{percentageChanges.aiAutomation}%</span>
              </div>
            </div>
            <p className="text-gray-500 text-xs">{stats.aiHandled.toLocaleString()} auto-handled</p>
          </div>

          {/* Avg Response Time Card */}
          <div className="bg-[#1e293b] rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-400 text-sm font-medium">Avg Response</div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                <FaClock className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-4xl font-bold text-white mb-2">0.6s</div>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-full border border-green-500/30">
                <FaArrowDown className="w-3 h-3 text-green-400" />
                <span className="text-green-400 text-sm font-semibold">{Math.abs(percentageChanges.responseTime)}%</span>
              </div>
            </div>
            <p className="text-gray-500 text-xs">Faster than before</p>
          </div>

          {/* High Priority Card */}
          <div className="bg-[#1e293b] rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-400 text-sm font-medium">High Priority</div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                <FaExclamationTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-4xl font-bold text-white mb-2">{stats.highPriority}</div>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-full border border-green-500/30">
                <FaArrowDown className="w-3 h-3 text-green-400" />
                <span className="text-green-400 text-sm font-semibold">{Math.abs(percentageChanges.highPriority)}%</span>
              </div>
            </div>
            <p className="text-gray-500 text-xs">AI handles most</p>
          </div>
        </div>

        {/* Channel Breakdown & Status Cards - Template Style */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Channel Breakdown */}
          <div className="bg-[#1e293b] border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Channel Performance</h3>
              <div className="text-gray-400 text-xs">This period vs last</div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-colors border border-gray-700/30">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                    <FaWhatsapp className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm font-medium mb-1">WhatsApp Leads</div>
                    <div className="text-2xl font-bold text-white">{stats.channelBreakdown.whatsapp.toLocaleString()}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1 mb-1">
                    <FaArrowUp className="w-3 h-3 text-green-400" />
                    <span className="text-green-400 text-sm font-semibold">78%</span>
                  </div>
                  <div className="text-gray-500 text-xs">AI Coverage</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-colors border border-gray-700/30">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30">
                    <FaEnvelope className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm font-medium mb-1">Email Leads</div>
                    <div className="text-2xl font-bold text-white">{stats.channelBreakdown.email.toLocaleString()}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1 mb-1">
                    <FaArrowUp className="w-3 h-3 text-green-400" />
                    <span className="text-green-400 text-sm font-semibold">75%</span>
                  </div>
                  <div className="text-gray-500 text-xs">AI Coverage</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-colors border border-gray-700/30">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <FaChartLine className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm font-medium mb-1">Portal Leads</div>
                    <div className="text-2xl font-bold text-white">{stats.channelBreakdown.portal.toLocaleString()}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1 mb-1">
                    <FaArrowUp className="w-3 h-3 text-green-400" />
                    <span className="text-green-400 text-sm font-semibold">82%</span>
                  </div>
                  <div className="text-gray-500 text-xs">AI Coverage</div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Summary Cards - Template Style */}
          <div className="bg-[#1e293b] border border-gray-700/50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Lead Status Overview</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-gray-800/40 border border-gray-700/50 rounded-xl hover:bg-gray-800/60 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                    <FaCheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-400 text-xs font-medium">Processed</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stats.aiHandled.toLocaleString()}</div>
                <div className="text-green-400 text-xs">87% of total</div>
              </div>
              <div className="p-5 bg-gray-800/40 border border-gray-700/50 rounded-xl hover:bg-gray-800/60 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                    <FaSpinner className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-400 text-xs font-medium">In Progress</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {Math.floor(stats.totalLeads * 0.08).toLocaleString()}
                </div>
                <div className="text-amber-400 text-xs">8% of total</div>
              </div>
              <div className="p-5 bg-gray-800/40 border border-gray-700/50 rounded-xl hover:bg-gray-800/60 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                    <FaExclamationTriangle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-400 text-xs font-medium">High Priority</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stats.highPriority.toLocaleString()}</div>
                <div className="text-purple-400 text-xs">Needs attention</div>
              </div>
              <div className="p-5 bg-gray-800/40 border border-gray-700/50 rounded-xl hover:bg-gray-800/60 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <FaClock className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-400 text-xs font-medium">Avg Response</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">0.6s</div>
                <div className="text-blue-400 text-xs">Sub-second</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Leads List - Takes 2 columns */}
          <div className="lg:col-span-2">
            <RecentLeadsList
              leads={filteredLeads}
              onLeadSelect={(lead) => {
                const channel = lead.channel === 'email' ? 'gmail' : lead.channel;
                window.location.href = `/${channel}`;
              }}
            />
          </div>

          {/* Quick Actions - Enhanced */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-[#1e293b] to-[#1e293b]/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/whatsapp"
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl hover:border-green-500/40 hover:bg-green-500/15 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform">
                    <FaWhatsapp className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold group-hover:text-green-400 transition-colors">
                      WhatsApp Demo
                    </h4>
                    <p className="text-gray-400 text-xs">Test lead processing</p>
                  </div>
                </Link>

                <Link
                  to="/gmail"
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-500/10 to-red-600/5 border border-red-500/20 rounded-xl hover:border-red-500/40 hover:bg-red-500/15 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/20 group-hover:scale-110 transition-transform">
                    <FaEnvelope className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold group-hover:text-red-400 transition-colors">
                      Gmail Demo
                    </h4>
                    <p className="text-gray-400 text-xs">See automatic replies</p>
                  </div>
                </Link>

                <Link
                  to="/backend"
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl hover:border-blue-500/40 hover:bg-blue-500/15 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                    <FaChartLine className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold group-hover:text-blue-400 transition-colors">
                      AI Pipeline
                    </h4>
                    <p className="text-gray-400 text-xs">Monitor processing</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-[#1e293b]/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4 text-white">Powered By</h3>
          <div className="flex flex-wrap gap-3">
            <span className="px-3 py-1.5 bg-gray-700/30 text-gray-300 rounded-lg text-sm border border-gray-600/50">
              Google Gemini 2.0
            </span>
            <span className="px-3 py-1.5 bg-gray-700/30 text-gray-300 rounded-lg text-sm border border-gray-600/50">
              Qdrant Vector DB
            </span>
            <span className="px-3 py-1.5 bg-gray-700/30 text-gray-300 rounded-lg text-sm border border-gray-600/50">
              Node.js + Express
            </span>
            <span className="px-3 py-1.5 bg-gray-700/30 text-gray-300 rounded-lg text-sm border border-gray-600/50">
              React + TypeScript
            </span>
            <span className="px-3 py-1.5 bg-gray-700/30 text-gray-300 rounded-lg text-sm border border-gray-600/50">
              Tailwind CSS
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}





