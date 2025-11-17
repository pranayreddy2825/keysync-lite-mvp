import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="h-full bg-[#0a0a0a] text-white overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-3">KeySync Lite</h1>
          <p className="text-gray-400 text-lg">Dubai Real Estate Lead Intelligence Platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#111111] border border-gray-800 rounded-xl p-6">
            <div className="text-gray-400 text-sm mb-2">Total Leads Processed</div>
            <div className="text-3xl font-bold text-white mb-1">1,247</div>
            <div className="text-emerald-400 text-sm">+12% this month</div>
          </div>
          <div className="bg-[#111111] border border-gray-800 rounded-xl p-6">
            <div className="text-gray-400 text-sm mb-2">AI Automation Rate</div>
            <div className="text-3xl font-bold text-white mb-1">87%</div>
            <div className="text-emerald-400 text-sm">Leads handled by AI</div>
          </div>
          <div className="bg-[#111111] border border-gray-800 rounded-xl p-6">
            <div className="text-gray-400 text-sm mb-2">Avg Response Time</div>
            <div className="text-3xl font-bold text-white mb-1">0.6s</div>
            <div className="text-emerald-400 text-sm">Sub-second responses</div>
          </div>
        </div>

        {/* Demo Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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

          <div className="bg-[#111111] border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-2xl">
                📊
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Analytics</h3>
                <p className="text-gray-400 text-sm">Coming soon</p>
              </div>
            </div>
            <p className="text-gray-500 text-sm">
              Detailed analytics and insights into lead performance, conversion rates, and AI effectiveness.
            </p>
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

