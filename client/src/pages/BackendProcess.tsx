import { useState } from 'react';

interface ProcessStep {
  id: number;
  name: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  duration?: number;
  details?: string;
  timestamp?: Date;
}

export default function BackendProcess() {
  const [steps, setSteps] = useState<ProcessStep[]>([
    { id: 1, name: 'Lead Received', status: 'complete', duration: 0, timestamp: new Date() },
    { id: 2, name: 'Text Preprocessing', status: 'complete', duration: 12, timestamp: new Date() },
    { id: 3, name: 'Gemini AI Analysis', status: 'complete', duration: 234, timestamp: new Date() },
    { id: 4, name: 'Qdrant Vector Search', status: 'complete', duration: 89, timestamp: new Date() },
    { id: 5, name: 'Persona Selection', status: 'complete', duration: 5, timestamp: new Date() },
    { id: 6, name: 'Lead Scoring', status: 'complete', duration: 8, timestamp: new Date() },
    { id: 7, name: 'Response Generation', status: 'complete', duration: 156, timestamp: new Date() },
    { id: 8, name: 'Response Delivered', status: 'complete', duration: 0, timestamp: new Date() },
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [totalTime, setTotalTime] = useState(0);

  const simulateProcess = () => {
    setIsRunning(true);
    setTotalTime(0);

    const newSteps: ProcessStep[] = steps.map((step) => ({
      ...step,
      status: 'pending' as const,
      duration: undefined,
      timestamp: undefined,
    }));

    setSteps(newSteps);

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < newSteps.length) {
        const updatedSteps = [...newSteps];
        updatedSteps[currentStep] = {
          ...updatedSteps[currentStep],
          status: 'running',
          timestamp: new Date(),
        };
        setSteps(updatedSteps);

        setTimeout(() => {
          const completedSteps = [...updatedSteps];
          const duration = Math.floor(Math.random() * 200) + 20;
          completedSteps[currentStep] = {
            ...completedSteps[currentStep],
            status: 'complete',
            duration,
            timestamp: new Date(),
          };
          setSteps(completedSteps);
          setTotalTime((prev) => prev + duration);
          currentStep++;
        }, 300);
      } else {
        clearInterval(interval);
        setIsRunning(false);
      }
    }, 400);
  };

  const getStatusColor = (status: ProcessStep['status']) => {
    switch (status) {
      case 'complete':
        return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
      case 'running':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30 animate-pulse';
      case 'error':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-800';
    }
  };

  const getStatusIcon = (status: ProcessStep['status']) => {
    switch (status) {
      case 'complete':
        return '✓';
      case 'running':
        return '⟳';
      case 'error':
        return '✕';
      default:
        return '○';
    }
  };

  return (
    <div className="h-full bg-[#0a0a0a] text-white overflow-y-auto p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Backend Process Monitor</h1>
          <p className="text-gray-400">Real-time visualization of lead processing pipeline</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#111111] border border-gray-800 rounded-xl p-4">
            <div className="text-gray-400 text-sm mb-1">Total Processing Time</div>
            <div className="text-2xl font-bold text-white">{totalTime}ms</div>
          </div>
          <div className="bg-[#111111] border border-gray-800 rounded-xl p-4">
            <div className="text-gray-400 text-sm mb-1">Steps Completed</div>
            <div className="text-2xl font-bold text-white">
              {steps.filter((s) => s.status === 'complete').length}/{steps.length}
            </div>
          </div>
          <div className="bg-[#111111] border border-gray-800 rounded-xl p-4">
            <div className="text-gray-400 text-sm mb-1">Status</div>
            <div className="text-2xl font-bold text-white">
              {isRunning ? (
                <span className="text-blue-400">Running</span>
              ) : (
                <span className="text-emerald-400">Idle</span>
              )}
            </div>
          </div>
        </div>

        {/* Control */}
        <div className="mb-8">
          <button
            onClick={simulateProcess}
            disabled={isRunning}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-medium hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isRunning ? 'Processing...' : 'Simulate Lead Processing'}
          </button>
        </div>

        {/* Process Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="relative">
              <div className="bg-[#111111] border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border ${getStatusColor(
                        step.status
                      )}`}
                    >
                      {getStatusIcon(step.status)}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">{step.name}</h3>
                      {step.details && <p className="text-gray-400 text-sm mt-1">{step.details}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    {step.duration !== undefined && (
                      <div className="text-emerald-400 font-mono text-sm">{step.duration}ms</div>
                    )}
                    {step.timestamp && (
                      <div className="text-gray-500 text-xs mt-1">
                        {step.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="absolute left-6 top-[72px] w-0.5 h-4 bg-gray-800"></div>
              )}
            </div>
          ))}
        </div>

        {/* System Info */}
        <div className="mt-8 bg-[#111111] border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">System Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Gemini Model:</span>
              <span className="text-white ml-2">gemini-2.0-flash</span>
            </div>
            <div>
              <span className="text-gray-400">Qdrant Collection:</span>
              <span className="text-white ml-2">keysync_knowledge</span>
            </div>
            <div>
              <span className="text-gray-400">Vector Dimension:</span>
              <span className="text-white ml-2">768</span>
            </div>
            <div>
              <span className="text-gray-400">Embedding Model:</span>
              <span className="text-white ml-2">text-embedding-004</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

