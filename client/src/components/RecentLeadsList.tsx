import { useState } from 'react';
import Badge from './ui/Badge';
import { FaWhatsapp, FaEnvelope, FaSearch } from 'react-icons/fa';

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
  onLeadSelect?: (lead: Lead) => void;
}

// Mock data - in production this would come from an API
const mockLeads: Lead[] = [
  {
    id: '1',
    clientName: 'Ahmed Al Mansoori',
    channel: 'whatsapp',
    messageSnippet: 'Hi, I\'m looking for a 1BR rental in JVC around 75k...',
    leadScore: 6,
    priority: 'medium',
    assignedAgent: 'Priya Varma',
    lastUpdated: new Date(Date.now() - 5 * 60000), // 5 minutes ago
    status: 'open',
  },
  {
    id: '2',
    clientName: 'Sarah Johnson',
    channel: 'email',
    messageSnippet: 'Interested in off-plan investment in Dubai Creek Harbour...',
    leadScore: 7,
    priority: 'medium',
    assignedAgent: 'Omar Haddad',
    lastUpdated: new Date(Date.now() - 15 * 60000), // 15 minutes ago
    status: 'in-progress',
  },
  {
    id: '3',
    clientName: 'Mohammed Hassan',
    channel: 'whatsapp',
    messageSnippet: 'Looking for villa on Palm Jumeirah around 10M AED...',
    leadScore: 9,
    priority: 'high',
    assignedAgent: 'Sarah Al Mansoori',
    lastUpdated: new Date(Date.now() - 30 * 60000), // 30 minutes ago
    status: 'open',
  },
  {
    id: '4',
    clientName: 'Emma Wilson',
    channel: 'email',
    messageSnippet: 'Need 2BR apartment in Dubai Marina, budget 2.5M...',
    leadScore: 8,
    priority: 'high',
    assignedAgent: 'Sarah Al Mansoori',
    lastUpdated: new Date(Date.now() - 45 * 60000), // 45 minutes ago
    status: 'in-progress',
  },
  {
    id: '5',
    clientName: 'David Chen',
    channel: 'whatsapp',
    messageSnippet: 'Exploring rental options in Sports City...',
    leadScore: 5,
    priority: 'low',
    assignedAgent: 'Priya Varma',
    lastUpdated: new Date(Date.now() - 2 * 3600000), // 2 hours ago
    status: 'closed',
  },
];

export default function RecentLeadsList({ onLeadSelect }: RecentLeadsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterChannel, setFilterChannel] = useState<'all' | 'whatsapp' | 'email' | 'portal'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed' | 'in-progress'>('all');

  const filteredLeads = mockLeads.filter((lead) => {
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
    <div className="bg-[#111111] border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Recent Leads</h3>
        <span className="text-sm text-gray-400">{filteredLeads.length} leads</span>
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
            className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        <select
          value={filterChannel}
          onChange={(e) => setFilterChannel(e.target.value as any)}
          className="px-3 py-1.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        >
          <option value="all">All Channels</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="email">Email</option>
          <option value="portal">Portal</option>
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value as any)}
          className="px-3 py-1.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        >
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-3 py-1.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Leads List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredLeads.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">No leads found matching your filters</div>
        ) : (
          filteredLeads.map((lead) => (
            <div
              key={lead.id}
              onClick={() => onLeadSelect?.(lead)}
              className="p-4 bg-gray-800/30 border border-gray-700 rounded-lg hover:bg-gray-800/50 hover:border-gray-600 cursor-pointer transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getChannelIcon(lead.channel)}
                  <span className="text-white font-medium text-sm">{lead.clientName}</span>
                </div>
                <span className="text-xs text-gray-500">{formatTimeAgo(lead.lastUpdated)}</span>
              </div>
              <p className="text-gray-400 text-sm mb-3 line-clamp-2">{lead.messageSnippet}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={getPriorityVariant(lead.priority)} size="sm">
                    Score: {lead.leadScore}/10
                  </Badge>
                  <Badge variant="default" size="sm" className={getStatusColor(lead.status)}>
                    {lead.status}
                  </Badge>
                </div>
                {lead.assignedAgent && (
                  <span className="text-xs text-gray-400">{lead.assignedAgent}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

