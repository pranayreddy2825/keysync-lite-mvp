import { useState, useRef, useEffect } from 'react';
import { FaArrowLeft, FaVideo, FaPhone, FaEllipsisV, FaSmile, FaPaperclip, FaMicrophone } from 'react-icons/fa';
import type { ChatMessage } from '../types';

interface WhatsAppViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isProcessing?: boolean;
}

export default function WhatsAppView({ messages, onSendMessage, isProcessing }: WhatsAppViewProps) {
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
    <div className="flex flex-col h-full bg-[#0e1621]">
      {/* WhatsApp Header */}
      <div className="h-16 bg-[#2a2f32] flex items-center justify-between px-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-gray-700 rounded-full transition-colors">
            <FaArrowLeft className="w-5 h-5 text-gray-300" />
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold">
            DB
          </div>
          <div>
            <div className="text-white font-medium">Dubai Buyer</div>
            <div className="text-gray-400 text-xs">+971 50 123 4567</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-700 rounded-full transition-colors">
            <FaVideo className="w-5 h-5 text-gray-300" />
          </button>
          <button className="p-2 hover:bg-gray-700 rounded-full transition-colors">
            <FaPhone className="w-5 h-5 text-gray-300" />
          </button>
          <button className="p-2 hover:bg-gray-700 rounded-full transition-colors">
            <FaEllipsisV className="w-5 h-5 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2 bg-[#0b141a] relative">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>

        <div className="relative z-10">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <p className="text-sm">Start a conversation to see messages here</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'client' ? 'justify-end' : 'justify-start'} mb-2`}
              >
                <div
                  className={`max-w-[75%] rounded-lg px-3 py-2 ${
                    message.sender === 'client'
                      ? 'bg-[#056162] text-white rounded-tr-none'
                      : 'bg-[#202c33] text-[#e9edef] rounded-tl-none'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-[10px] opacity-70">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {message.sender === 'client' && (
                      <span className="text-[10px] opacity-70">✓✓</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          {isProcessing && (
            <div className="flex justify-start mb-2">
              <div className="bg-[#202c33] rounded-lg rounded-tl-none px-4 py-3">
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
      </div>

      {/* Input Bar */}
      <div className="h-16 bg-[#1e2428] flex items-center gap-2 px-4 border-t border-gray-700">
        <button className="p-2 hover:bg-gray-700 rounded-full transition-colors">
          <FaSmile className="w-5 h-5 text-gray-400" />
        </button>
        <button className="p-2 hover:bg-gray-700 rounded-full transition-colors">
          <FaPaperclip className="w-5 h-5 text-gray-400" />
        </button>
        <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message"
            disabled={isProcessing}
            className="flex-1 bg-[#2a2f32] border-none rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 disabled:opacity-50"
          />
          {inputText.trim() ? (
            <button
              type="submit"
              disabled={isProcessing}
              className="p-2 bg-[#00a884] text-white rounded-full hover:bg-[#008069] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FaMicrophone className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            >
              <FaMicrophone className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

