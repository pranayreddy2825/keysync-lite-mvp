// Demo data for dashboard with timestamps and team assignments
export interface DemoLead {
  id: string;
  clientName: string;
  channel: 'whatsapp' | 'email' | 'portal';
  messageSnippet: string;
  leadScore: number;
  priority: 'low' | 'medium' | 'high';
  assignedAgent: string;
  team: 'luxury' | 'off-plan' | 'rental';
  lastUpdated: Date;
  status: 'open' | 'closed' | 'in-progress';
}

// Type that matches RecentLeadsList Lead interface (without team field for compatibility)
export type LeadForList = Omit<DemoLead, 'team'> & { assignedAgent?: string };

// Generate demo leads with various timestamps
const now = Date.now();
const oneHour = 60 * 60 * 1000;
const oneDay = 24 * 60 * 60 * 1000;
const oneWeek = 7 * 24 * 60 * 60 * 1000;

export const demoLeads: DemoLead[] = [
  // Today's leads
  {
    id: '1',
    clientName: 'Ahmed Al Mansoori',
    channel: 'whatsapp',
    messageSnippet: 'Hi, I\'m looking for a 1BR rental in JVC around 75k...',
    leadScore: 6,
    priority: 'medium',
    assignedAgent: 'Priya Varma',
    team: 'rental',
    lastUpdated: new Date(now - 5 * 60000), // 5 minutes ago
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
    team: 'off-plan',
    lastUpdated: new Date(now - 15 * 60000), // 15 minutes ago
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
    team: 'luxury',
    lastUpdated: new Date(now - 30 * 60000), // 30 minutes ago
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
    team: 'luxury',
    lastUpdated: new Date(now - 45 * 60000), // 45 minutes ago
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
    team: 'rental',
    lastUpdated: new Date(now - 2 * oneHour), // 2 hours ago
    status: 'closed',
  },
  // This week's leads
  {
    id: '6',
    clientName: 'Fatima Al Zahra',
    channel: 'email',
    messageSnippet: 'Interested in off-plan properties in Business Bay...',
    leadScore: 7,
    priority: 'medium',
    assignedAgent: 'Omar Haddad',
    team: 'off-plan',
    lastUpdated: new Date(now - 2 * oneDay), // 2 days ago
    status: 'in-progress',
  },
  {
    id: '7',
    clientName: 'James Anderson',
    channel: 'whatsapp',
    messageSnippet: 'Looking for luxury penthouse in Downtown Dubai...',
    leadScore: 9,
    priority: 'high',
    assignedAgent: 'Sarah Al Mansoori',
    team: 'luxury',
    lastUpdated: new Date(now - 3 * oneDay), // 3 days ago
    status: 'open',
  },
  {
    id: '8',
    clientName: 'Layla Mohammed',
    channel: 'email',
    messageSnippet: 'Need 1BR furnished rental in JLT, budget 90k...',
    leadScore: 6,
    priority: 'medium',
    assignedAgent: 'Priya Varma',
    team: 'rental',
    lastUpdated: new Date(now - 4 * oneDay), // 4 days ago
    status: 'open',
  },
  {
    id: '9',
    clientName: 'Robert Taylor',
    channel: 'portal',
    messageSnippet: 'Investment opportunity in Sobha Hartland...',
    leadScore: 8,
    priority: 'high',
    assignedAgent: 'Omar Haddad',
    team: 'off-plan',
    lastUpdated: new Date(now - 5 * oneDay), // 5 days ago
    status: 'in-progress',
  },
  {
    id: '10',
    clientName: 'Aisha Khan',
    channel: 'whatsapp',
    messageSnippet: 'Rental apartment in Al Barsha, 2BR preferred...',
    leadScore: 5,
    priority: 'low',
    assignedAgent: 'Priya Varma',
    team: 'rental',
    lastUpdated: new Date(now - 6 * oneDay), // 6 days ago
    status: 'closed',
  },
  // This month's leads
  {
    id: '11',
    clientName: 'Michael Brown',
    channel: 'email',
    messageSnippet: 'Luxury villa in Emirates Hills, 15M+ budget...',
    leadScore: 10,
    priority: 'high',
    assignedAgent: 'Sarah Al Mansoori',
    team: 'luxury',
    lastUpdated: new Date(now - 10 * oneDay), // 10 days ago
    status: 'open',
  },
  {
    id: '12',
    clientName: 'Sara Al Maktoum',
    channel: 'whatsapp',
    messageSnippet: 'Off-plan studio in Dubai Creek Harbour...',
    leadScore: 6,
    priority: 'medium',
    assignedAgent: 'Omar Haddad',
    team: 'off-plan',
    lastUpdated: new Date(now - 12 * oneDay), // 12 days ago
    status: 'in-progress',
  },
  {
    id: '13',
    clientName: 'Thomas Wilson',
    channel: 'email',
    messageSnippet: 'Rental inquiry for 3BR in Dubai Marina...',
    leadScore: 7,
    priority: 'medium',
    assignedAgent: 'Priya Varma',
    team: 'rental',
    lastUpdated: new Date(now - 15 * oneDay), // 15 days ago
    status: 'closed',
  },
  {
    id: '14',
    clientName: 'Noor Al Suwaidi',
    channel: 'whatsapp',
    messageSnippet: 'Luxury apartment in Palm Jumeirah, 8M budget...',
    leadScore: 9,
    priority: 'high',
    assignedAgent: 'Sarah Al Mansoori',
    team: 'luxury',
    lastUpdated: new Date(now - 18 * oneDay), // 18 days ago
    status: 'open',
  },
  {
    id: '15',
    clientName: 'Daniel Lee',
    channel: 'portal',
    messageSnippet: 'Off-plan investment in Dubai Hills Estate...',
    leadScore: 7,
    priority: 'medium',
    assignedAgent: 'Omar Haddad',
    team: 'off-plan',
    lastUpdated: new Date(now - 20 * oneDay), // 20 days ago
    status: 'in-progress',
  },
  // Older leads (all time)
  {
    id: '16',
    clientName: 'Hala Al Rashid',
    channel: 'email',
    messageSnippet: 'Rental property in JVC, 1BR or 2BR...',
    leadScore: 5,
    priority: 'low',
    assignedAgent: 'Priya Varma',
    team: 'rental',
    lastUpdated: new Date(now - 25 * oneDay), // 25 days ago
    status: 'closed',
  },
  {
    id: '17',
    clientName: 'Christopher Martinez',
    channel: 'whatsapp',
    messageSnippet: 'Luxury penthouse Downtown Dubai, 12M+...',
    leadScore: 10,
    priority: 'high',
    assignedAgent: 'Sarah Al Mansoori',
    team: 'luxury',
    lastUpdated: new Date(now - 30 * oneDay), // 30 days ago
    status: 'open',
  },
  {
    id: '18',
    clientName: 'Maya Patel',
    channel: 'email',
    messageSnippet: 'Off-plan 2BR in Business Bay, payment plan...',
    leadScore: 8,
    priority: 'high',
    assignedAgent: 'Omar Haddad',
    team: 'off-plan',
    lastUpdated: new Date(now - 35 * oneDay), // 35 days ago
    status: 'in-progress',
  },
  // Additional leads for more realistic numbers
  {
    id: '19',
    clientName: 'Alex Thompson',
    channel: 'whatsapp',
    messageSnippet: 'Looking for 3BR villa in Emirates Hills...',
    leadScore: 9,
    priority: 'high',
    assignedAgent: 'Sarah Al Mansoori',
    team: 'luxury',
    lastUpdated: new Date(now - 1 * oneHour), // 1 hour ago
    status: 'open',
  },
  {
    id: '20',
    clientName: 'Lina Al Fahad',
    channel: 'email',
    messageSnippet: 'Rental inquiry for studio in JLT...',
    leadScore: 5,
    priority: 'low',
    assignedAgent: 'Priya Varma',
    team: 'rental',
    lastUpdated: new Date(now - 3 * oneHour), // 3 hours ago
    status: 'open',
  },
  {
    id: '21',
    clientName: 'Kevin O\'Brien',
    channel: 'whatsapp',
    messageSnippet: 'Off-plan investment in Dubai Hills Estate...',
    leadScore: 8,
    priority: 'high',
    assignedAgent: 'Omar Haddad',
    team: 'off-plan',
    lastUpdated: new Date(now - 4 * oneHour), // 4 hours ago
    status: 'in-progress',
  },
  {
    id: '22',
    clientName: 'Rania Al Maktoum',
    channel: 'email',
    messageSnippet: 'Luxury apartment Downtown, 6M budget...',
    leadScore: 9,
    priority: 'high',
    assignedAgent: 'Sarah Al Mansoori',
    team: 'luxury',
    lastUpdated: new Date(now - 6 * oneHour), // 6 hours ago
    status: 'open',
  },
  {
    id: '23',
    clientName: 'Mark Stevens',
    channel: 'whatsapp',
    messageSnippet: 'Need 2BR rental in Al Barsha...',
    leadScore: 6,
    priority: 'medium',
    assignedAgent: 'Priya Varma',
    team: 'rental',
    lastUpdated: new Date(now - 8 * oneHour), // 8 hours ago
    status: 'in-progress',
  },
  {
    id: '24',
    clientName: 'Yasmin Ali',
    channel: 'portal',
    messageSnippet: 'Off-plan studio in Business Bay...',
    leadScore: 7,
    priority: 'medium',
    assignedAgent: 'Omar Haddad',
    team: 'off-plan',
    lastUpdated: new Date(now - 12 * oneHour), // 12 hours ago
    status: 'open',
  },
  {
    id: '25',
    clientName: 'Peter Johnson',
    channel: 'email',
    messageSnippet: 'Luxury penthouse Palm Jumeirah, 15M+...',
    leadScore: 10,
    priority: 'high',
    assignedAgent: 'Sarah Al Mansoori',
    team: 'luxury',
    lastUpdated: new Date(now - 1 * oneDay), // 1 day ago
    status: 'open',
  },
  {
    id: '26',
    clientName: 'Sofia Martinez',
    channel: 'whatsapp',
    messageSnippet: 'Rental 1BR in JVC, furnished preferred...',
    leadScore: 5,
    priority: 'low',
    assignedAgent: 'Priya Varma',
    team: 'rental',
    lastUpdated: new Date(now - 1.5 * oneDay), // 1.5 days ago
    status: 'closed',
  },
  {
    id: '27',
    clientName: 'Hassan Al Zaabi',
    channel: 'email',
    messageSnippet: 'Off-plan investment Dubai Creek Harbour...',
    leadScore: 8,
    priority: 'high',
    assignedAgent: 'Omar Haddad',
    team: 'off-plan',
    lastUpdated: new Date(now - 2 * oneDay), // 2 days ago
    status: 'in-progress',
  },
  {
    id: '28',
    clientName: 'Jennifer White',
    channel: 'whatsapp',
    messageSnippet: 'Luxury villa Emirates Hills, sea view...',
    leadScore: 9,
    priority: 'high',
    assignedAgent: 'Sarah Al Mansoori',
    team: 'luxury',
    lastUpdated: new Date(now - 2.5 * oneDay), // 2.5 days ago
    status: 'open',
  },
  {
    id: '29',
    clientName: 'Omar Al Shamsi',
    channel: 'email',
    messageSnippet: 'Rental 2BR Sports City, budget 90k...',
    leadScore: 6,
    priority: 'medium',
    assignedAgent: 'Priya Varma',
    team: 'rental',
    lastUpdated: new Date(now - 3 * oneDay), // 3 days ago
    status: 'open',
  },
  {
    id: '30',
    clientName: 'Lisa Anderson',
    channel: 'portal',
    messageSnippet: 'Off-plan 3BR Sobha Hartland...',
    leadScore: 7,
    priority: 'medium',
    assignedAgent: 'Omar Haddad',
    team: 'off-plan',
    lastUpdated: new Date(now - 3.5 * oneDay), // 3.5 days ago
    status: 'in-progress',
  },
  {
    id: '31',
    clientName: 'Ahmed Al Nuaimi',
    channel: 'whatsapp',
    messageSnippet: 'Luxury apartment Dubai Marina, 5M...',
    leadScore: 8,
    priority: 'high',
    assignedAgent: 'Sarah Al Mansoori',
    team: 'luxury',
    lastUpdated: new Date(now - 4 * oneDay), // 4 days ago
    status: 'open',
  },
  {
    id: '32',
    clientName: 'Rachel Green',
    channel: 'email',
    messageSnippet: 'Rental studio JLT, furnished...',
    leadScore: 5,
    priority: 'low',
    assignedAgent: 'Priya Varma',
    team: 'rental',
    lastUpdated: new Date(now - 5 * oneDay), // 5 days ago
    status: 'closed',
  },
  {
    id: '33',
    clientName: 'Khalid Al Mansoori',
    channel: 'whatsapp',
    messageSnippet: 'Off-plan investment Business Bay...',
    leadScore: 8,
    priority: 'high',
    assignedAgent: 'Omar Haddad',
    team: 'off-plan',
    lastUpdated: new Date(now - 6 * oneDay), // 6 days ago
    status: 'in-progress',
  },
  {
    id: '34',
    clientName: 'Emma Davis',
    channel: 'email',
    messageSnippet: 'Luxury penthouse Downtown, 10M+...',
    leadScore: 9,
    priority: 'high',
    assignedAgent: 'Sarah Al Mansoori',
    team: 'luxury',
    lastUpdated: new Date(now - 7 * oneDay), // 7 days ago
    status: 'open',
  },
  {
    id: '35',
    clientName: 'Mohammed Al Suwaidi',
    channel: 'whatsapp',
    messageSnippet: 'Rental 1BR Al Barsha, 70k budget...',
    leadScore: 6,
    priority: 'medium',
    assignedAgent: 'Priya Varma',
    team: 'rental',
    lastUpdated: new Date(now - 8 * oneDay), // 8 days ago
    status: 'open',
  },
  {
    id: '36',
    clientName: 'Sophie Brown',
    channel: 'portal',
    messageSnippet: 'Off-plan 2BR Dubai Creek Harbour...',
    leadScore: 7,
    priority: 'medium',
    assignedAgent: 'Omar Haddad',
    team: 'off-plan',
    lastUpdated: new Date(now - 9 * oneDay), // 9 days ago
    status: 'in-progress',
  },
  {
    id: '37',
    clientName: 'Faisal Al Zaabi',
    channel: 'email',
    messageSnippet: 'Luxury villa Palm Jumeirah, 20M...',
    leadScore: 10,
    priority: 'high',
    assignedAgent: 'Sarah Al Mansoori',
    team: 'luxury',
    lastUpdated: new Date(now - 11 * oneDay), // 11 days ago
    status: 'open',
  },
  {
    id: '38',
    clientName: 'Olivia Wilson',
    channel: 'whatsapp',
    messageSnippet: 'Rental 2BR JVC, unfurnished...',
    leadScore: 5,
    priority: 'low',
    assignedAgent: 'Priya Varma',
    team: 'rental',
    lastUpdated: new Date(now - 13 * oneDay), // 13 days ago
    status: 'closed',
  },
  {
    id: '39',
    clientName: 'Tariq Al Maktoum',
    channel: 'email',
    messageSnippet: 'Off-plan investment Dubai Hills...',
    leadScore: 8,
    priority: 'high',
    assignedAgent: 'Omar Haddad',
    team: 'off-plan',
    lastUpdated: new Date(now - 14 * oneDay), // 14 days ago
    status: 'in-progress',
  },
  {
    id: '40',
    clientName: 'Isabella Garcia',
    channel: 'whatsapp',
    messageSnippet: 'Luxury apartment Marina, 4M budget...',
    leadScore: 8,
    priority: 'high',
    assignedAgent: 'Sarah Al Mansoori',
    team: 'luxury',
    lastUpdated: new Date(now - 16 * oneDay), // 16 days ago
    status: 'open',
  },
  {
    id: '41',
    clientName: 'Yusuf Al Rashid',
    channel: 'email',
    messageSnippet: 'Rental 3BR Sports City, family...',
    leadScore: 6,
    priority: 'medium',
    assignedAgent: 'Priya Varma',
    team: 'rental',
    lastUpdated: new Date(now - 17 * oneDay), // 17 days ago
    status: 'open',
  },
  {
    id: '42',
    clientName: 'Charlotte Taylor',
    channel: 'portal',
    messageSnippet: 'Off-plan studio Business Bay...',
    leadScore: 7,
    priority: 'medium',
    assignedAgent: 'Omar Haddad',
    team: 'off-plan',
    lastUpdated: new Date(now - 19 * oneDay), // 19 days ago
    status: 'in-progress',
  },
  {
    id: '43',
    clientName: 'Hamdan Al Nuaimi',
    channel: 'whatsapp',
    messageSnippet: 'Luxury penthouse Downtown, 12M...',
    leadScore: 9,
    priority: 'high',
    assignedAgent: 'Sarah Al Mansoori',
    team: 'luxury',
    lastUpdated: new Date(now - 21 * oneDay), // 21 days ago
    status: 'open',
  },
  {
    id: '44',
    clientName: 'Amelia Jones',
    channel: 'email',
    messageSnippet: 'Rental 1BR JLT, furnished...',
    leadScore: 5,
    priority: 'low',
    assignedAgent: 'Priya Varma',
    team: 'rental',
    lastUpdated: new Date(now - 22 * oneDay), // 22 days ago
    status: 'closed',
  },
  {
    id: '45',
    clientName: 'Majid Al Shamsi',
    channel: 'whatsapp',
    messageSnippet: 'Off-plan 2BR Dubai Creek Harbour...',
    leadScore: 8,
    priority: 'high',
    assignedAgent: 'Omar Haddad',
    team: 'off-plan',
    lastUpdated: new Date(now - 24 * oneDay), // 24 days ago
    status: 'in-progress',
  },
  {
    id: '46',
    clientName: 'Grace Lee',
    channel: 'email',
    messageSnippet: 'Luxury villa Emirates Hills, 18M...',
    leadScore: 10,
    priority: 'high',
    assignedAgent: 'Sarah Al Mansoori',
    team: 'luxury',
    lastUpdated: new Date(now - 26 * oneDay), // 26 days ago
    status: 'open',
  },
  {
    id: '47',
    clientName: 'Saeed Al Zaabi',
    channel: 'whatsapp',
    messageSnippet: 'Rental 2BR Al Barsha, 85k...',
    leadScore: 6,
    priority: 'medium',
    assignedAgent: 'Priya Varma',
    team: 'rental',
    lastUpdated: new Date(now - 27 * oneDay), // 27 days ago
    status: 'open',
  },
  {
    id: '48',
    clientName: 'Lily Chen',
    channel: 'portal',
    messageSnippet: 'Off-plan investment Sobha Hartland...',
    leadScore: 7,
    priority: 'medium',
    assignedAgent: 'Omar Haddad',
    team: 'off-plan',
    lastUpdated: new Date(now - 28 * oneDay), // 28 days ago
    status: 'in-progress',
  },
];

// Helper functions to filter leads
export function filterLeadsByTimeRange(
  leads: DemoLead[],
  timeRange: 'today' | 'week' | 'month' | 'all'
): DemoLead[] {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  const oneMonth = 30 * 24 * 60 * 60 * 1000;

  switch (timeRange) {
    case 'today':
      return leads.filter(lead => {
        const leadTime = lead.lastUpdated.getTime();
        return (now - leadTime) < oneDay;
      });
    case 'week':
      return leads.filter(lead => {
        const leadTime = lead.lastUpdated.getTime();
        return (now - leadTime) < oneWeek;
      });
    case 'month':
      return leads.filter(lead => {
        const leadTime = lead.lastUpdated.getTime();
        return (now - leadTime) < oneMonth;
      });
    case 'all':
    default:
      return leads;
  }
}

export function filterLeadsByTeam(
  leads: DemoLead[],
  team: 'all' | 'luxury' | 'off-plan' | 'rental'
): DemoLead[] {
  if (team === 'all') return leads;
  return leads.filter(lead => lead.team === team);
}

// Calculate stats from filtered leads (works with both DemoLead and LeadForList)
// For realistic business numbers, we scale up the actual filtered count
export function calculateStats(leads: (DemoLead | LeadForList)[]) {
  const actualCount = leads.length;
  
  // Scale factor to make numbers look like a real business dashboard
  // Different scale factors for different time ranges to simulate realistic growth
  let scaleFactor = 1;
  
  if (actualCount > 0) {
    // For smaller filtered sets (today), scale more aggressively
    // For larger sets (all time), scale less to keep numbers realistic
    if (actualCount <= 10) {
      scaleFactor = 120; // Today: ~10 leads * 120 = ~1,200 leads
    } else if (actualCount <= 20) {
      scaleFactor = 60; // This week: ~20 leads * 60 = ~1,200 leads
    } else if (actualCount <= 30) {
      scaleFactor = 40; // This month: ~30 leads * 40 = ~1,200 leads
    } else {
      scaleFactor = 25; // All time: ~48 leads * 25 = ~1,200 leads
    }
  }
  
  const totalLeads = actualCount * scaleFactor;
  const highPriorityCount = leads.filter(l => l.priority === 'high').length;
  // Reduce high priority to show AI handles most leads (max 25% of total)
  const highPriorityPercentage = Math.min(0.25, highPriorityCount / actualCount);
  const highPriority = Math.floor(totalLeads * highPriorityPercentage);
  const aiHandled = Math.floor(totalLeads * 0.87); // 87% automation rate
  const avgResponseTime = 0.6; // seconds

  // Calculate channel breakdown with scaling
  // Make numbers higher and percentages around 70-80% to show high AI coverage
  const whatsappCount = leads.filter(l => l.channel === 'whatsapp').length;
  const emailCount = leads.filter(l => l.channel === 'email').length;
  const portalCount = leads.filter(l => l.channel === 'portal').length;

  // Scale up channel numbers to show high engagement (70-80% range)
  const channelScaleFactor = scaleFactor * 1.2; // Increase by 20% for higher numbers
  
  const channelBreakdown = {
    whatsapp: Math.floor(whatsappCount * channelScaleFactor),
    email: Math.floor(emailCount * channelScaleFactor),
    portal: Math.floor(portalCount * channelScaleFactor),
  };

  return {
    totalLeads,
    highPriority,
    aiHandled,
    avgResponseTime,
    channelBreakdown,
  };
}

