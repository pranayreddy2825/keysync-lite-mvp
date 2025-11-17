import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';

interface CustomerViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isProcessing?: boolean;
}

export default function CustomerView({ messages, onSendMessage, isProcessing }: CustomerViewProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isProcessing) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] border-r border-gray-800">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-800 bg-[#111111]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold text-lg">
            K
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg">KeySync Dubai</h2>
            <p className="text-gray-400 text-sm">online · replying under 1s</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-sm">Start a conversation to see messages here</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'client' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  message.sender === 'client'
                    ? 'bg-[#1a5490] text-white rounded-br-sm'
                    : 'bg-[#1f1f1f] text-gray-100 rounded-bl-sm border border-gray-800'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                <p className={`text-xs mt-1 ${message.sender === 'client' ? 'text-blue-200' : 'text-gray-500'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {message.sender === 'ai' && ' ✓✓'}
                </p>
              </div>
            </div>
          ))
        )}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-[#1f1f1f] border border-gray-800 rounded-2xl rounded-bl-sm px-4 py-2.5">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="px-4 py-4 border-t border-gray-800 bg-[#111111]">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            disabled={isProcessing}
            className="flex-1 bg-[#1a1a1a] border border-gray-800 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isProcessing}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-medium hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

