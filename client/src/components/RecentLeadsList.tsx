import { useState } from 'react';
import Badge from './ui/Badge';
import { FaWhatsapp, FaEnvelope, FaSearch, FaDownload } from 'react-icons/fa';

interface Lead {
  id: string;
  clientName: string;
  channel: 'whatsapp' | 'email' | 'portal';
  messageSnippet: string;
  leadScore: number;
  priority: 'low' | 'medium' | 'high';
  assignedAgent?: string;
  lastUpdated: Date;
  status: 'open' | 'closed' | 'in-progress';
}

interface RecentLeadsListProps {
  leads?: Lead[];
  onLeadSelect?: (lead: Lead) => void;
}

// Fallback mock data if no leads provided
const defaultMockLeads: Lead[] = [
  {
    id: '1',
    clientName: 'Ahmed Al Mansoori',
    channel: 'whatsapp',
    messageSnippet: 'Hi, I\'m looking for a 1BR rental in JVC around 75k...',
    leadScore: 6,
    priority: 'medium',
    assignedAgent: 'Priya Varma',
    lastUpdated: new Date(Date.now() - 5 * 60000),
    status: 'open',
  },
];

export default function RecentLeadsList({ leads = defaultMockLeads, onLeadSelect }: RecentLeadsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterChannel, setFilterChannel] = useState<'all' | 'whatsapp' | 'email' | 'portal'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed' | 'in-progress'>('all');

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.messageSnippet.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChannel = filterChannel === 'all' || lead.channel === filterChannel;
    const matchesPriority = filterPriority === 'all' || lead.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;

    return matchesSearch && matchesChannel && matchesPriority && matchesStatus;
  });

  const getChannelIcon = (channel: Lead['channel']) => {
    switch (channel) {
      case 'whatsapp':
        return <FaWhatsapp className="w-4 h-4" style={{ color: '#25D366' }} />;
      case 'email':
        return <FaEnvelope className="w-4 h-4" style={{ color: '#EA4335' }} />;
      default:
        return <FaEnvelope className="w-4 h-4" />;
    }
  };

  const getPriorityVariant = (priority: Lead['priority']): 'error' | 'warning' | 'muted' => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      default:
        return 'muted';
    }
  };

  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'open':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'in-progress':
        return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
      case 'closed':
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="bg-gradient-to-br from-[#1e293b] to-[#1e293b]/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Recent Leads</h3>
          <p className="text-gray-400 text-xs">{filteredLeads.length} leads found</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 bg-gray-700/30 border border-gray-600/50 rounded-lg text-white text-sm hover:bg-gray-700/50 transition-colors flex items-center gap-2">
            <FaDownload className="w-3 h-3" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or message..."
            className="w-full pl-10 pr-4 py-2 bg-gray-700/30 border border-gray-600/50 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        <select
          value={filterChannel}
          onChange={(e) => setFilterChannel(e.target.value as any)}
          className="px-3 py-1.5 bg-gray-700/30 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="all">All Channels</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="email">Email</option>
          <option value="portal">Portal</option>
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value as any)}
          className="px-3 py-1.5 bg-gray-700/30 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-3 py-1.5 bg-gray-700/30 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Leads List - Enhanced Table Style */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 pb-3 mb-3 border-b border-gray-700/50 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            <div className="col-span-3">Client</div>
            <div className="col-span-2">Channel</div>
            <div className="col-span-3">Message</div>
            <div className="col-span-1">Score</div>
            <div className="col-span-1">Priority</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1">Time</div>
          </div>
          
          {/* Table Body */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredLeads.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-sm">
                <div className="mb-2">No leads found matching your filters</div>
                <div className="text-xs text-gray-600">Try adjusting your search or filters</div>
              </div>
            ) : (
              filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => onLeadSelect?.(lead)}
                  className="grid grid-cols-12 gap-4 p-4 bg-gray-800/20 border border-gray-700/30 rounded-xl hover:bg-gray-800/40 hover:border-gray-600/50 cursor-pointer transition-all group"
                >
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                      {lead.clientName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-white font-medium text-sm truncate">{lead.clientName}</span>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <div className="flex items-center gap-2">
                      {getChannelIcon(lead.channel)}
                      <span className="text-gray-300 text-xs capitalize">{lead.channel}</span>
                    </div>
                  </div>
                  <div className="col-span-3">
                    <p className="text-gray-400 text-sm line-clamp-1 group-hover:text-gray-300 transition-colors">{lead.messageSnippet}</p>
                  </div>
                  <div className="col-span-1 flex items-center">
                    <Badge variant={getPriorityVariant(lead.priority)} size="sm">
                      {lead.leadScore}/10
                    </Badge>
                  </div>
                  <div className="col-span-1 flex items-center">
                    <Badge variant={getPriorityVariant(lead.priority)} size="sm">
                      {lead.priority}
                    </Badge>
                  </div>
                  <div className="col-span-1 flex items-center">
                    <Badge variant="default" size="sm" className={getStatusColor(lead.status)}>
                      {lead.status}
                    </Badge>
                  </div>
                  <div className="col-span-1 flex items-center">
                    <span className="text-xs text-gray-500">{formatTimeAgo(lead.lastUpdated)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

