import type { LeadResponse } from '../types';
import { Card } from './ui/Card';
import Badge from './ui/Badge';
import { EmptyState } from './ui/EmptyState';
import { Skeleton } from './ui/Skeleton';

interface IntelligenceViewProps {
  data: LeadResponse | null;
  isLoading?: boolean;
}

export default function IntelligenceView({ data, isLoading = false }: IntelligenceViewProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-[#0a0a0a] overflow-y-auto">
        <div className="p-6 space-y-6">
          <Card>
            <Skeleton lines={3} />
          </Card>
          <Card>
            <Skeleton lines={4} />
          </Card>
          <Card>
            <Skeleton lines={5} />
          </Card>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <EmptyState
        description="Paste a real lead message from WhatsApp, email, or portal to see a full AI-powered analysis here."
        icon="🔍"
      />
    );
  }

  const { analysis, persona, handling_mode } = data;

  // Pipeline steps
  const pipelineSteps = [
    { id: 1, label: 'Lead Captured', status: 'complete' as const },
    { id: 2, label: 'AI Analysis', status: 'complete' as const },
    {
      id: 3,
      label: 'Knowledge Retrieval',
      status: analysis.qdrant_context && analysis.qdrant_context.length > 0 ? ('complete' as const) : ('pending' as const),
    },
    { id: 4, label: 'Persona Assignment', status: 'complete' as const },
    { id: 5, label: 'Response Generated', status: 'complete' as const },
  ];

  const getPriorityVariant = (priority: string): 'error' | 'warning' | 'muted' => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      default:
        return 'muted';
    }
  };

  const getHandlingVariant = (mode: string): 'success' | 'info' => {
    return mode === 'ai' ? 'success' : 'info';
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Lead Summary & Score */}
        <Card title="Lead Summary & Score">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-gray-400 text-xs mb-2">Lead Score</div>
                <div className="text-3xl font-bold text-white">{analysis.lead_score}/10</div>
              </div>
              <div>
                <div className="text-gray-400 text-xs mb-2">Priority</div>
                <Badge variant={getPriorityVariant(analysis.priority)} size="md">
                  {analysis.priority.toUpperCase()}
                </Badge>
              </div>
            </div>

            <div>
              <div className="text-gray-400 text-xs mb-2">Handling Mode</div>
              <Badge variant={getHandlingVariant(handling_mode)} size="md">
                {handling_mode === 'ai' ? 'AI Handled' : 'Escalated to Human'}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-800">
              <Badge variant="default" size="sm">
                {analysis.intent === 'buy' ? 'Buyer' : 'Renter'}
              </Badge>
              {analysis.area && analysis.area !== 'Unknown' && (
                <Badge variant="info" size="sm">
                  {analysis.area}
                </Badge>
              )}
              {analysis.budget && analysis.budget > 0 && (
                <Badge variant="warning" size="sm">
                  {(analysis.budget / 1000000).toFixed(1)}M AED
                </Badge>
              )}
              {analysis.client_type !== 'unknown' && (
                <Badge variant="default" size="sm">
                  {analysis.client_type === 'investor' ? 'Investor' : 'End User'}
                </Badge>
              )}
              {analysis.timeframe && analysis.timeframe !== 'unspecified' && (
                <Badge variant="muted" size="sm">
                  {analysis.timeframe}
                </Badge>
              )}
            </div>
          </div>
        </Card>

        {/* Pipeline & Extraction */}
        <Card title="Pipeline & Extraction">
          <div className="space-y-3 relative">
            {pipelineSteps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-3 relative">
                <div className="relative">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border ${
                      step.status === 'complete'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-gray-500/20 text-gray-500 border border-gray-800'
                    }`}
                  >
                    {step.status === 'complete' ? '✓' : step.id}
                  </div>
                  {index < pipelineSteps.length - 1 && (
                    <div className="absolute left-1/2 top-8 w-0.5 h-6 bg-gray-800 -translate-x-1/2"></div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{step.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-800">
            <div className="text-gray-400 text-xs mb-3">Extracted Fields</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500 mb-1">Intent</div>
                <div className="text-white font-medium capitalize">{analysis.intent}</div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Area</div>
                <div className="text-white font-medium">{analysis.area || '—'}</div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Budget (AED)</div>
                <div className="text-white font-medium">
                  {analysis.budget && analysis.budget > 0
                    ? `${analysis.budget.toLocaleString('en-AE')}`
                    : '—'}
                </div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Timeframe</div>
                <div className="text-white font-medium">{analysis.timeframe || '—'}</div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Client Type</div>
                <div className="text-white font-medium capitalize">{analysis.client_type}</div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Language</div>
                <div className="text-white font-medium uppercase">{analysis.language}</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Persona & Routing */}
        <Card title="Persona & Routing">
          <div className="space-y-4">
            <div>
              <div className="text-gray-400 text-xs mb-1">Assigned Specialist</div>
              <div className="text-white font-semibold text-lg mb-1">{persona.name}</div>
              <div className="text-gray-400 text-sm">{persona.specialty}</div>
            </div>
            <div>
              <div className="text-gray-400 text-xs mb-2">Focus Areas</div>
              <div className="flex flex-wrap gap-2">
                {persona.areas.map((area) => (
                  <Badge key={area} variant="default" size="sm">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-xs mb-1">Description</div>
              <p className="text-gray-300 text-sm leading-relaxed">{persona.description}</p>
            </div>
          </div>
        </Card>

        {/* Knowledge & Context */}
        <Card title="Knowledge & Context">
          {analysis.qdrant_context && analysis.qdrant_context.length > 0 ? (
            <ul className="space-y-3">
              {analysis.qdrant_context.map((snippet, index) => {
                const payload = snippet.payload || {};
                const metaParts = [];

                if (payload.type) metaParts.push(payload.type);
                if (payload.area) metaParts.push(payload.area);
                if (payload.topic) metaParts.push(payload.topic);
                if (payload.persona_id) metaParts.push(`persona: ${payload.persona_id}`);

                const meta = metaParts.length > 0 ? ` (${metaParts.join(' • ')})` : '';

                return (
                  <li key={index} className="text-gray-300 text-sm leading-relaxed">
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-1">•</span>
                      <span>
                        {snippet.text}
                        {meta && <span className="text-gray-500 text-xs">{meta}</span>}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-gray-500 text-sm">No relevant knowledge snippets retrieved for this lead.</div>
          )}
        </Card>
      </div>
    </div>
  );
}
