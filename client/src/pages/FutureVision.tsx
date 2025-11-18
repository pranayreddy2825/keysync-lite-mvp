import { useState, useEffect, useRef } from 'react';
import { 
  FaLanguage, FaWhatsapp, FaEnvelope, 
  FaGlobe, FaRobot, FaUserCheck, FaRoute, FaDatabase, FaCalendarAlt, 
  FaHeart, FaHome, FaChartBar, FaSync, FaShieldAlt, FaLock, FaServer,
  FaSalesforce, FaGoogle, FaFileAlt, FaPlug
} from 'react-icons/fa';

interface VisionCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  children?: React.ReactNode;
  delay?: number;
}

function VisionCard({ title, description, icon: Icon, iconColor, children, delay = 0 }: VisionCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setIsVisible(true);
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [delay]);

  return (
    <div
      ref={cardRef}
      className={`bg-[#1e293b] border border-gray-700/50 rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:border-gray-600/70 hover:scale-[1.02] transition-all duration-500 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="flex items-start gap-4 mb-6">
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${iconColor} flex items-center justify-center shadow-lg flex-shrink-0 transition-transform duration-300 group-hover:scale-110`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-white mb-2 tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            {title}
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed font-medium">{description}</p>
        </div>
      </div>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}

function VisionHero() {
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setIsVisible(true);
            }, 100);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => {
      if (heroRef.current) {
        observer.unobserve(heroRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={heroRef}
      className={`text-center mb-16 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } transition-all duration-700 ease-out`}
    >
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full mb-6 backdrop-blur-sm">
        <FaRobot className="w-4 h-4 text-blue-400" />
        <span className="text-blue-400 text-sm font-semibold">Future Vision</span>
      </div>
      <h1 className="text-6xl font-bold mb-6 tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        The Future of
        <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient">
          KeySync
        </span>
      </h1>
      <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-medium">
        A next-generation AI platform for real-estate teams across the GCC — built for multi-language intelligence,
        omni-channel automation, and deep understanding of customer behavior.
      </p>
      <div className="mt-8 flex justify-center gap-2">
        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
        <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  );
}

export default function FutureVision() {
  return (
    <div className="h-full bg-[#0f172a] text-white overflow-y-auto">
      <div className="max-w-7xl mx-auto p-8">
        <VisionHero />

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Language Intelligence */}
          <VisionCard
            title="AI Fluent in English & Arabic"
            description="KeySync will support native-level English + Arabic analysis and reply generation. AI detects language automatically and adapts tone, dialect, and formality based on Gulf region preferences."
            icon={FaLanguage}
            iconColor="from-blue-500 to-cyan-500"
            delay={0}
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:bg-gray-800/50 hover:border-gray-600/50 transition-all duration-300">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  <FaLanguage className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium text-sm">Automatic Language Detection</div>
                  <div className="text-gray-400 text-xs">Detects and responds in the client's preferred language</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:bg-gray-800/50 hover:border-gray-600/50 transition-all duration-300">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  <FaLanguage className="w-4 h-4 text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium text-sm">Gulf Region Dialects</div>
                  <div className="text-gray-400 text-xs">Understands Emirati, Saudi, Qatari, and other GCC dialects</div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap mt-4">
                <span className="px-3 py-1 bg-gray-800/50 rounded-full text-xs text-gray-300 border border-gray-700/50">English</span>
                <span className="px-3 py-1 bg-gray-800/50 rounded-full text-xs text-gray-300 border border-gray-700/50">Arabic</span>
                <span className="px-3 py-1 bg-gray-800/50 rounded-full text-xs text-gray-300 border border-gray-700/50">Hindi</span>
                <span className="px-3 py-1 bg-gray-800/50 rounded-full text-xs text-gray-300 border border-gray-700/50">Urdu</span>
                <span className="px-3 py-1 bg-gray-800/50 rounded-full text-xs text-gray-300 border border-gray-700/50">Russian</span>
                <span className="px-3 py-1 bg-gray-800/50 rounded-full text-xs text-gray-300 border border-gray-700/50">French</span>
              </div>
            </div>
          </VisionCard>

          {/* Omni-Channel Expansion */}
          <VisionCard
            title="Full Omni-Channel Communication"
            description="In the full KeySync platform, your AI will handle every inbound channel and unify conversations into a single smart inbox."
            icon={FaGlobe}
            iconColor="from-green-500 to-emerald-500"
            delay={100}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center gap-2 p-3 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:bg-gray-800/50 hover:border-gray-600/50 hover:scale-105 transition-all duration-300 cursor-pointer">
                <FaWhatsapp className="w-5 h-5 text-green-400" />
                <span className="text-white text-sm font-medium">WhatsApp</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:bg-gray-800/50 hover:border-gray-600/50 hover:scale-105 transition-all duration-300 cursor-pointer">
                <FaEnvelope className="w-5 h-5 text-red-400" />
                <span className="text-white text-sm font-medium">Gmail / Email</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:bg-gray-800/50 hover:border-gray-600/50 hover:scale-105 transition-all duration-300 cursor-pointer">
                <FaHome className="w-5 h-5 text-orange-400" />
                <span className="text-white text-sm font-medium">Property Portals</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-blue-300 text-xs font-medium">
                Bayut, Dubizzle, Property Finder, and website chatbots — all unified in one intelligent inbox.
              </p>
            </div>
          </VisionCard>

          {/* AI Agent Workforce */}
          <VisionCard
            title="Your AI Real-Estate Team"
            description="A coordinated multi-agent system working together to handle every aspect of lead management and conversion."
            icon={FaRobot}
            iconColor="from-purple-500 to-pink-500"
            delay={200}
          >
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:bg-gray-800/50 hover:border-purple-500/50 hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaSync className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="text-white font-semibold text-sm">AI Follow-up Agent</div>
                  <div className="text-gray-400 text-xs">Automatically follows up with leads at optimal times</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:bg-gray-800/50 hover:border-purple-500/50 hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaUserCheck className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="text-white font-semibold text-sm">AI Qualification Agent</div>
                  <div className="text-gray-400 text-xs">Intelligently qualifies leads and assigns priority scores</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:bg-gray-800/50 hover:border-purple-500/50 hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaRoute className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="text-white font-semibold text-sm">AI Routing Engine</div>
                  <div className="text-gray-400 text-xs">Assigns leads to the right specialist based on expertise</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:bg-gray-800/50 hover:border-purple-500/50 hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaDatabase className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="text-white font-semibold text-sm">AI CRM Update Bot</div>
                  <div className="text-gray-400 text-xs">Automatically updates CRM with conversation insights</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:bg-gray-800/50 hover:border-purple-500/50 hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaCalendarAlt className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="text-white font-semibold text-sm">AI Appointment Setter</div>
                  <div className="text-gray-400 text-xs">Schedules viewings and meetings automatically</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:bg-gray-800/50 hover:border-purple-500/50 hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaHeart className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="text-white font-semibold text-sm">AI Customer Sentiment Scanner</div>
                  <div className="text-gray-400 text-xs">Monitors customer satisfaction and flags concerns</div>
                </div>
              </div>
            </div>
          </VisionCard>

          {/* Intelligent Property Recommendations */}
          <VisionCard
            title="AI Powered Property Matching"
            description="Advanced property intelligence that goes beyond simple search to understand customer preferences and behavior patterns."
            icon={FaHome}
            iconColor="from-orange-500 to-red-500"
            delay={300}
          >
            <div className="space-y-3">
              <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:bg-gray-800/50 hover:border-orange-500/50 hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-orange-400 group-hover:scale-125 transition-transform duration-300"></div>
                  <span className="text-white font-semibold text-sm">Multimodal Retrieval</span>
                </div>
                <p className="text-gray-400 text-xs">Images + text embeddings for intelligent property search</p>
              </div>
              <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:bg-gray-800/50 hover:border-orange-500/50 hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-orange-400 group-hover:scale-125 transition-transform duration-300"></div>
                  <span className="text-white font-semibold text-sm">Automatic Comparison Tables</span>
                </div>
                <p className="text-gray-400 text-xs">AI generates side-by-side property comparisons automatically</p>
              </div>
              <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:bg-gray-800/50 hover:border-orange-500/50 hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-orange-400 group-hover:scale-125 transition-transform duration-300"></div>
                  <span className="text-white font-semibold text-sm">Brochure & Floorplan Summarization</span>
                </div>
                <p className="text-gray-400 text-xs">AI extracts key details from property documents instantly</p>
              </div>
              <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:bg-gray-800/50 hover:border-orange-500/50 hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-orange-400 group-hover:scale-125 transition-transform duration-300"></div>
                  <span className="text-white font-semibold text-sm">Behavior-Based Suggestions</span>
                </div>
                <p className="text-gray-400 text-xs">Dynamic property recommendations based on customer interactions</p>
              </div>
            </div>
          </VisionCard>

          {/* Team Performance Dashboard */}
          <VisionCard
            title="Advanced Analytics & Reporting"
            description="Comprehensive insights into lead quality, agent performance, and conversion metrics to optimize your real estate operations."
            icon={FaChartBar}
            iconColor="from-cyan-500 to-blue-500"
            delay={400}
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 text-center hover:bg-gray-800/50 hover:border-cyan-500/50 hover:scale-105 transition-all duration-300 cursor-pointer group">
                <div className="text-2xl font-bold text-cyan-400 mb-1 group-hover:scale-110 transition-transform duration-300">Heatmaps</div>
                <div className="text-gray-400 text-xs">Lead quality visualization</div>
              </div>
              <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 text-center hover:bg-gray-800/50 hover:border-cyan-500/50 hover:scale-105 transition-all duration-300 cursor-pointer group">
                <div className="text-2xl font-bold text-cyan-400 mb-1 group-hover:scale-110 transition-transform duration-300">KPIs</div>
                <div className="text-gray-400 text-xs">Response time metrics</div>
              </div>
              <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 text-center hover:bg-gray-800/50 hover:border-cyan-500/50 hover:scale-105 transition-all duration-300 cursor-pointer group">
                <div className="text-2xl font-bold text-cyan-400 mb-1 group-hover:scale-110 transition-transform duration-300">Predictions</div>
                <div className="text-gray-400 text-xs">Conversion probability</div>
              </div>
              <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 text-center hover:bg-gray-800/50 hover:border-cyan-500/50 hover:scale-105 transition-all duration-300 cursor-pointer group">
                <div className="text-2xl font-bold text-cyan-400 mb-1 group-hover:scale-110 transition-transform duration-300">Funnels</div>
                <div className="text-gray-400 text-xs">Channel breakdown</div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <p className="text-cyan-300 text-xs">
                Real-time agent performance tracking, lead quality heatmaps, and conversion forecasting powered by AI.
              </p>
            </div>
          </VisionCard>

          {/* CRM Integrations */}
          <VisionCard
            title="Seamless Integrations"
            description="Connect KeySync with your existing tools and workflows. Native integrations with major CRM platforms and custom API access."
            icon={FaPlug}
            iconColor="from-indigo-500 to-purple-500"
            delay={500}
          >
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 flex flex-col items-center justify-center hover:bg-gray-800/50 hover:border-indigo-500/50 hover:scale-110 transition-all duration-300 cursor-pointer group">
                <FaSalesforce className="w-8 h-8 text-blue-400 mb-2 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-white text-xs font-medium">Salesforce</span>
              </div>
              <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 flex flex-col items-center justify-center hover:bg-gray-800/50 hover:border-indigo-500/50 hover:scale-110 transition-all duration-300 cursor-pointer group">
                <div className="w-8 h-8 rounded bg-orange-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-xs font-bold">H</span>
                </div>
                <span className="text-white text-xs font-medium">HubSpot</span>
              </div>
              <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 flex flex-col items-center justify-center hover:bg-gray-800/50 hover:border-indigo-500/50 hover:scale-110 transition-all duration-300 cursor-pointer group">
                <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-xs font-bold">Z</span>
                </div>
                <span className="text-white text-xs font-medium">Zoho</span>
              </div>
              <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 flex flex-col items-center justify-center hover:bg-gray-800/50 hover:border-indigo-500/50 hover:scale-110 transition-all duration-300 cursor-pointer group">
                <FaHome className="w-8 h-8 text-orange-400 mb-2 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-white text-xs font-medium">Property Finder</span>
              </div>
              <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 flex flex-col items-center justify-center hover:bg-gray-800/50 hover:border-indigo-500/50 hover:scale-110 transition-all duration-300 cursor-pointer group">
                <FaHome className="w-8 h-8 text-green-400 mb-2 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-white text-xs font-medium">Dubizzle</span>
              </div>
              <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 flex flex-col items-center justify-center hover:bg-gray-800/50 hover:border-indigo-500/50 hover:scale-110 transition-all duration-300 cursor-pointer group">
                <FaGoogle className="w-8 h-8 text-green-400 mb-2 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-white text-xs font-medium">Google Sheets</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
              <div className="flex items-center gap-2">
                <FaPlug className="w-4 h-4 text-indigo-400" />
                <p className="text-indigo-300 text-xs font-medium">Custom API & Webhooks available for enterprise integrations</p>
              </div>
            </div>
          </VisionCard>

          {/* Automated Compliance & Data Protection */}
          <VisionCard
            title="Secure, GCC-Compliant AI"
            description="Enterprise-grade security and compliance built for GCC real estate agencies. Your data stays protected and compliant."
            icon={FaShieldAlt}
            iconColor="from-emerald-500 to-teal-500"
            delay={600}
          >
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:bg-gray-800/50 hover:border-emerald-500/50 hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
                <FaLock className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                <div>
                  <div className="text-white font-semibold text-sm mb-1">End-to-End Encryption</div>
                  <div className="text-gray-400 text-xs">No data stored without encryption. All communications are secured.</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:bg-gray-800/50 hover:border-emerald-500/50 hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
                <FaServer className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                <div>
                  <div className="text-white font-semibold text-sm mb-1">GCC Data Localization</div>
                  <div className="text-gray-400 text-xs">Configurable data residency options for GCC compliance requirements.</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:bg-gray-800/50 hover:border-emerald-500/50 hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
                <FaFileAlt className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                <div>
                  <div className="text-white font-semibold text-sm mb-1">Configurable Data Retention</div>
                  <div className="text-gray-400 text-xs">Set custom retention policies aligned with your business and regulatory needs.</div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <p className="text-emerald-300 text-xs font-medium">
                  SOC 2 compliant • GDPR ready • GCC data sovereignty support
                </p>
              </div>
            </div>
          </VisionCard>
        </div>

        {/* Vision Statement Footer */}
        <div className="mt-16 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-gray-700/50 rounded-2xl p-12 text-center backdrop-blur-sm shadow-2xl">
          <div className="inline-block p-4 bg-blue-500/20 rounded-full mb-6">
            <FaRobot className="w-16 h-16 text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold mb-4 tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            Built for GCC Real Estate
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed font-medium">
            KeySync is designed from the ground up for the unique needs of GCC real estate markets.
            We understand local preferences, regulations, and business practices, ensuring your AI
            speaks the language of your clients and operates within regional compliance standards.
          </p>
        </div>
      </div>
    </div>
  );
}
