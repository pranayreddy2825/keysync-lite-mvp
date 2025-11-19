import { useState } from 'react';
import WhatsAppView from '../components/WhatsAppView';
import AiPipelinePanel from '../components/AiPipelinePanel';
import type { ChatMessage, LeadResponse } from '../types';
import { analyzeLead, type ApiError } from '../api/leadAnalysis';
import { FaInfoCircle } from 'react-icons/fa';

export default function WhatsAppDemo() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [intelligenceData, setIntelligenceData] = useState<LeadResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastInputText, setLastInputText] = useState('');

  const handleSendMessage = async (text: string) => {
    const clientMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      sender: 'client',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, clientMessage]);
    setIsProcessing(true);
    setIntelligenceData(null);
    setLastInputText(text);

    try {
      // Check if this is the first message (no AI messages yet)
      const isFirstMessage = messages.filter(m => m.sender === 'ai').length === 0;
      
      const data = await analyzeLead({
        channel: 'whatsapp',
        text,
        isFirstMessage,
      });

      setIntelligenceData(data);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: data.reply,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      const apiError = err as ApiError;
      console.error('Error analyzing lead:', apiError);

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: apiError.message || 'Sorry, there was an error processing your message. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Customer POV Notice */}
      <div className="bg-blue-500/20 border-b border-blue-500/30 px-6 py-4">
        <div className="flex items-start gap-3">
          <FaInfoCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-blue-300 font-semibold text-sm mb-1">Customer Point of View (POV)</p>
            <p className="text-gray-400 text-xs leading-relaxed">
              This section simulates the <strong className="text-gray-300">customer's perspective</strong> - showing how clients interact with KeySync Lite's AI agent via WhatsApp. 
              This is <strong className="text-gray-300">not part of the internal product dashboard</strong>, but rather demonstrates the end-user experience 
              when customers send messages and receive AI-powered responses. This view helps showcase the seamless, conversational experience our AI provides to real estate leads.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
      {/* Left Panel - WhatsApp View */}
      <div className="w-full lg:w-1/2 flex-shrink-0 border-r border-gray-800">
        <WhatsAppView
          messages={messages}
          onSendMessage={handleSendMessage}
          isProcessing={isProcessing}
          recommendedProperties={intelligenceData?.recommendedProperties}
        />
      </div>

      {/* Right Panel - AI Pipeline */}
      <div className="w-full lg:w-1/2 flex-shrink-0">
        <AiPipelinePanel
          data={intelligenceData}
          isLoading={isProcessing}
          channel="whatsapp"
          inputText={lastInputText}
        />
      </div>
      </div>
    </div>
  );
}

