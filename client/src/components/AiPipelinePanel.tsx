import type { LeadResponse } from '../types';
import { Card } from './ui/Card';
import Badge from './ui/Badge';
import { Skeleton } from './ui/Skeleton';
import { EmptyState } from './ui/EmptyState';
import { FaCheckCircle, FaCircle, FaSpinner } from 'react-icons/fa';

interface AiPipelinePanelProps {
  data: LeadResponse | null;
  isLoading?: boolean;
  channel?: 'whatsapp' | 'email';
  inputText?: string;
}

interface PipelineStep {
  id: number;
  label: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  details?: React.ReactNode;
}

export default function AiPipelinePanel({ data, isLoading = false, channel = 'whatsapp', inputText }: AiPipelinePanelProps) {
  if (isLoading) {
    return (
      <div className="h-full bg-[#0a0a0a] overflow-y-auto p-6">
        <div className="space-y-6">
          <Card>
            <Skeleton lines={3} />
          </Card>
          <Card>
            <Skeleton lines={4} />
          </Card>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <EmptyState
        description="Send a message to see the AI pipeline process it step by step."
        icon="⚙️"
      />
    );
  }

  const { analysis, persona, reply, handling_mode } = data;

  // Build pipeline steps with details
  const steps: PipelineStep[] = [
    {
      id: 1,
      label: 'Input Received',
      status: 'complete',
      details: (
        <div className="mt-3 space-y-2">
          <div className="text-sm">
            <span className="text-gray-400">Channel:</span>{' '}
            <Badge variant="info" size="sm">
              {channel === 'whatsapp' ? 'WhatsApp' : 'Email'}
            </Badge>
          </div>
          {inputText && (
            <div className="text-sm">
              <span className="text-gray-400">Message:</span>
              <div className="mt-1 p-2 bg-gray-800/50 rounded text-gray-300 text-xs font-mono">
                {inputText.substring(0, 100)}
                {inputText.length > 100 ? '...' : ''}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 2,
      label: 'Gemini: Understanding & Extraction',
      status: 'complete',
      details: (
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-400">Intent:</span>
              <div className="text-white font-medium capitalize mt-1">{analysis.intent}</div>
            </div>
            <div>
              <span className="text-gray-400">Client Type:</span>
              <div className="text-white font-medium capitalize mt-1">{analysis.client_type}</div>
            </div>
            <div>
              <span className="text-gray-400">Area:</span>
              <div className="text-white font-medium mt-1">{analysis.area || '—'}</div>
            </div>
            <div>
              <span className="text-gray-400">Budget:</span>
              <div className="text-white font-medium mt-1">
                {analysis.budget && analysis.budget > 0
                  ? `${(analysis.budget / 1000000).toFixed(1)}M AED`
                  : '—'}
              </div>
            </div>
            <div>
              <span className="text-gray-400">Timeframe:</span>
              <div className="text-white font-medium mt-1">{analysis.timeframe || '—'}</div>
            </div>
            <div>
              <span className="text-gray-400">Language:</span>
              <div className="text-white font-medium uppercase mt-1">{analysis.language}</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      label: 'Qdrant: Knowledge Retrieval',
      status: analysis.qdrant_context && analysis.qdrant_context.length > 0 ? 'complete' : 'pending',
      details:
        analysis.qdrant_context && analysis.qdrant_context.length > 0 ? (
          <div className="mt-3 space-y-2">
            <div className="text-sm text-gray-400">
              Retrieved {analysis.qdrant_context.length} relevant snippet(s) from knowledge base
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {analysis.qdrant_context.slice(0, 3).map((snippet, idx) => (
                <div key={idx} className="p-2 bg-gray-800/50 rounded text-xs text-gray-300">
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <div>
                      <div>{snippet.text.substring(0, 120)}...</div>
                      <div className="text-gray-500 mt-1">Score: {snippet.score.toFixed(3)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-3 text-sm text-gray-500">No relevant knowledge retrieved</div>
        ),
    },
    {
      id: 4,
      label: 'Persona Assignment',
      status: 'complete',
      details: (
        <div className="mt-3 space-y-2">
          <div className="text-sm">
            <span className="text-gray-400">Assigned:</span>
            <div className="text-white font-semibold mt-1">{persona.name}</div>
            <div className="text-gray-400 text-xs mt-1">{persona.specialty}</div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {persona.areas.map((area) => (
              <Badge key={area} variant="default" size="sm">
                {area}
              </Badge>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 5,
      label: 'Gemini: Response Generation',
      status: 'complete',
      details: (
        <div className="mt-3">
          <div className="text-sm text-gray-400 mb-2">
            Generated response using persona context and retrieved knowledge
          </div>
          <div className="p-3 bg-gray-800/50 rounded text-sm text-gray-300 max-h-32 overflow-y-auto">
            {reply.substring(0, 200)}
            {reply.length > 200 ? '...' : ''}
          </div>
        </div>
      ),
    },
    {
      id: 6,
      label: 'Scoring & Routing',
      status: 'complete',
      details: (
        <div className="mt-3 space-y-3">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-gray-400 text-xs mb-1">Lead Score</div>
              <div className="text-2xl font-bold text-white">{analysis.lead_score}/10</div>
            </div>
            <div>
              <div className="text-gray-400 text-xs mb-1">Priority</div>
              <Badge
                variant={analysis.priority === 'high' ? 'error' : analysis.priority === 'medium' ? 'warning' : 'muted'}
                size="md"
              >
                {analysis.priority.toUpperCase()}
              </Badge>
            </div>
            <div>
              <div className="text-gray-400 text-xs mb-1">Handling</div>
              <Badge variant={handling_mode === 'ai' ? 'success' : 'info'} size="md">
                {handling_mode === 'ai' ? 'AI' : 'Human'}
              </Badge>
            </div>
          </div>
          {handling_mode === 'human' && (
            <div className="p-2 bg-blue-500/20 border border-blue-500/30 rounded text-xs text-blue-400">
              High-value lead escalated to senior advisor
            </div>
          )}
        </div>
      ),
    },
  ];

  const getStepIcon = (status: PipelineStep['status']) => {
    switch (status) {
      case 'complete':
        return <FaCheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'running':
        return <FaSpinner className="w-5 h-5 text-blue-400 animate-spin" />;
      case 'error':
        return <FaCircle className="w-5 h-5 text-red-400" />;
      default:
        return <FaCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="h-full bg-[#0a0a0a] overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">AI Pipeline</h2>
          <p className="text-gray-400 text-sm">Step-by-step analysis of how KeySync processed this lead</p>
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="relative">
              <Card>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">{getStepIcon(step.status)}</div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-2">{step.label}</h3>
                    {step.details}
                  </div>
                </div>
              </Card>
              {index < steps.length - 1 && (
                <div className="absolute left-6 top-full w-0.5 h-4 bg-gray-800"></div>
              )}
            </div>
          ))}
        </div>

        {/* Technical Details (Collapsible) */}
        <Card title="Technical Details">
          <details className="text-xs">
            <summary className="cursor-pointer text-gray-400 hover:text-white mb-3">
              Show raw analysis data
            </summary>
            <pre className="p-4 bg-gray-900 rounded overflow-x-auto text-gray-300">
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        </Card>
      </div>
    </div>
  );
}

