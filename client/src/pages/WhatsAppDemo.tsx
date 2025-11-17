import { useState } from 'react';
import WhatsAppView from '../components/WhatsAppView';
import AiPipelinePanel from '../components/AiPipelinePanel';
import type { ChatMessage, LeadResponse } from '../types';
import { analyzeLead, type ApiError } from '../api/leadAnalysis';

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
      const data = await analyzeLead({
        channel: 'whatsapp',
        text,
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
    <div className="flex h-full">
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
  );
}

