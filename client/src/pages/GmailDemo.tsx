import { useState } from 'react';
import AiPipelinePanel from '../components/AiPipelinePanel';
import PropertyCard from '../components/PropertyCard';
import type { LeadResponse } from '../types';
import { analyzeLead, type ApiError } from '../api/leadAnalysis';
import { FaBold, FaItalic, FaUnderline, FaListUl, FaAlignLeft, FaTrash, FaInfoCircle } from 'react-icons/fa';

interface Email {
  id: string;
  from: string;
  subject: string;
  body: string;
  timestamp: Date;
  isRead: boolean;
}

export default function GmailDemo() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [intelligenceData, setIntelligenceData] = useState<LeadResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [composeTo, setComposeTo] = useState('keysync@dubairealestate.ae');
  const [composeCc, setComposeCc] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [lastInputText, setLastInputText] = useState('');

  const handleSendEmail = async () => {
    if (!composeBody.trim()) return;

    const newEmail: Email = {
      id: Date.now().toString(),
      from: 'client@example.com',
      subject: composeSubject || 'Property Inquiry',
      body: composeBody,
      timestamp: new Date(),
      isRead: false,
    };

    setEmails((prev) => [newEmail, ...prev]);
    setSelectedEmail(newEmail);
    setIsProcessing(true);
    setShowCompose(false);
    setLastInputText(composeBody);

    try {
      // For email, treat each new email as potentially first (no conversation history tracking yet)
      const data = await analyzeLead({
        channel: 'email',
        text: composeBody,
        isFirstMessage: true, // Email replies are typically first-time interactions
      });

      setIntelligenceData(data);

      // Add auto-reply email
      const replyEmail: Email = {
        id: (Date.now() + 1).toString(),
        from: 'keysync@dubairealestate.ae',
        subject: `Re: ${composeSubject || 'Property Inquiry'}`,
        body: data.reply,
        timestamp: new Date(),
        isRead: false,
      };

      setEmails((prev) => [replyEmail, ...prev]);
      setComposeTo('keysync@dubairealestate.ae');
      setComposeCc('');
      setComposeSubject('');
      setComposeBody('');
    } catch (err) {
      const apiError = err as ApiError;
      console.error('Error analyzing lead:', apiError);
      // Error handling - could show error state in UI
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
          {/* Customer POV Notice */}
          <div className="bg-blue-500/20 border-b border-blue-500/30 px-6 py-4">
            <div className="flex items-start gap-3">
              <FaInfoCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-blue-300 font-semibold text-sm mb-1">Customer Point of View (POV)</p>
                <p className="text-gray-400 text-xs leading-relaxed">
                  This section simulates the <strong className="text-gray-300">customer's perspective</strong> - showing how clients interact with KeySync Lite's AI agent via email. 
                  This is <strong className="text-gray-300">not part of the internal product dashboard</strong>, but rather demonstrates the end-user experience 
                  when customers send email inquiries and receive AI-powered automatic replies. This view helps showcase the professional, intelligent email responses our AI provides to real estate leads.
                </p>
              </div>
            </div>
          </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Gmail Interface */}
        <div className="w-full lg:w-1/2 flex-shrink-0 flex flex-col border-r border-gray-800">
        {/* Gmail Header */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <img src="https://www.gstatic.com/images/branding/product/1x/gmail_48dp.png" alt="Gmail" className="h-8" />
            <span className="text-gray-700 font-medium">Mail</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCompose(true)}
              className="px-4 py-2 bg-[#1a73e8] text-white rounded-lg text-sm font-medium hover:bg-[#1557b0] shadow-sm"
            >
              Compose
            </button>
          </div>
        </div>

        {/* Email List */}
        <div className="flex-1 bg-white overflow-y-auto">
          {emails.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="mb-4">No emails yet</p>
              <button
                onClick={() => setShowCompose(true)}
                className="px-6 py-2 bg-[#1a73e8] text-white rounded-lg hover:bg-[#1557b0]"
              >
                Compose Email
              </button>
            </div>
          ) : (
            <div>
              {emails.map((email) => (
                <div
                  key={email.id}
                  onClick={() => setSelectedEmail(email)}
                  className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                    selectedEmail?.id === email.id ? 'bg-blue-50' : ''
                  } ${!email.isRead ? 'bg-blue-50/30' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                      {email.from.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900 font-medium text-sm">{email.from}</span>
                          {!email.isRead && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                        </div>
                        <span className="text-gray-500 text-xs">
                          {email.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-gray-700 font-medium text-sm mb-1 truncate">{email.subject}</div>
                      <div className="text-gray-600 text-sm line-clamp-2">{email.body}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>

        {/* Right Panel - Email View + Intelligence */}
        <div className="w-full lg:w-1/2 flex-shrink-0 flex flex-col">
        {selectedEmail ? (
          <>
            {/* Email Detail View */}
            <div className="flex-1 bg-white border-b border-gray-800 overflow-y-auto">
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">{selectedEmail.subject}</h2>
                <div className="flex items-start gap-3 mb-6 pb-4 border-b border-gray-200">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {selectedEmail.from.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-gray-900 font-medium">{selectedEmail.from}</div>
                      <div className="text-gray-500 text-sm">
                        {selectedEmail.timestamp.toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                    <div className="text-gray-500 text-sm mb-4">to me</div>
                    <div className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-4">{selectedEmail.body}</div>
                    {/* Show properties if available */}
                    {intelligenceData?.recommendedProperties && intelligenceData.recommendedProperties.length > 0 && (
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <h3 className="text-gray-900 font-semibold text-sm mb-3">Recommended Properties</h3>
                        <div className="space-y-3">
                          {intelligenceData.recommendedProperties.map((property) => (
                            <PropertyCard key={property.id} property={property} variant="gmail" />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            </div>

            {/* AI Pipeline View */}
            <div className="h-96 border-t border-gray-800 overflow-y-auto">
              <AiPipelinePanel
                data={intelligenceData}
                isLoading={isProcessing}
                channel="email"
                inputText={lastInputText}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <p>Select an email to view details and intelligence analysis</p>
          </div>
        )}
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl h-[600px] flex flex-col">
            {/* Compose Header */}
            <div className="h-12 bg-gray-100 flex items-center justify-between px-4 border-b border-gray-200">
              <span className="text-gray-700 font-medium">New Message</span>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded">−</button>
                <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded">□</button>
                <button
                  onClick={() => {
                    setShowCompose(false);
                    setComposeSubject('');
                    setComposeBody('');
                  }}
                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Compose Body */}
            <div className="flex-1 flex flex-col p-4">
              <div className="mb-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 text-sm w-16">From:</span>
                  <input
                    type="text"
                    value="client@example.com"
                    readOnly
                    className="flex-1 border-b border-gray-300 pb-1 text-sm text-gray-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 text-sm w-16">To:</span>
                  <input
                    type="text"
                    value={composeTo}
                    onChange={(e) => setComposeTo(e.target.value)}
                    className="flex-1 border-b border-gray-300 pb-1 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 text-sm w-16">Cc:</span>
                  <input
                    type="text"
                    value={composeCc}
                    onChange={(e) => setComposeCc(e.target.value)}
                    placeholder="Optional"
                    className="flex-1 border-b border-gray-300 pb-1 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 text-sm w-16">Subject:</span>
                  <input
                    type="text"
                    value={composeSubject}
                    onChange={(e) => setComposeSubject(e.target.value)}
                    placeholder="Property Inquiry"
                    className="flex-1 border-b border-gray-300 pb-1 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <textarea
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                placeholder="Type your message here..."
                className="flex-1 resize-none border-none focus:outline-none text-sm"
              />
            </div>

            {/* Compose Footer */}
            <div className="h-14 bg-gray-50 border-t border-gray-200 flex items-center justify-between px-4">
              <div className="flex items-center gap-1">
                <button className="p-2 hover:bg-gray-200 rounded text-gray-600" title="Font">
                  <span className="text-sm font-semibold">Aa</span>
                </button>
                <button className="p-2 hover:bg-gray-200 rounded text-gray-600" title="Bold">
                  <FaBold className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-gray-200 rounded text-gray-600" title="Italic">
                  <FaItalic className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-gray-200 rounded text-gray-600" title="Underline">
                  <FaUnderline className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-gray-200 rounded text-gray-600" title="List">
                  <FaListUl className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-gray-200 rounded text-gray-600" title="Align">
                  <FaAlignLeft className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                <button className="p-2 hover:bg-gray-200 rounded text-gray-600" title="Emoji">
                  😊
                </button>
                <button className="p-2 hover:bg-gray-200 rounded text-gray-600" title="Attachment">
                  📎
                </button>
                <button
                  onClick={() => {
                    setComposeSubject('');
                    setComposeBody('');
                    setComposeCc('');
                  }}
                  className="p-2 hover:bg-gray-200 rounded text-gray-600 ml-2"
                  title="Discard"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCompose(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded text-sm"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded text-sm">Save</button>
                <button
                  onClick={handleSendEmail}
                  disabled={!composeBody.trim() || isProcessing}
                  className="px-6 py-2 bg-[#1a73e8] text-white rounded text-sm font-medium hover:bg-[#1557b0] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        </div>
        )}
    </div>
  );
}

