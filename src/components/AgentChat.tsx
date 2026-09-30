import React, { useState } from 'react';
import { Send, Bot, User, Sparkles, AlertCircle, CornerDownLeft, Play, FileText, CheckCircle2 } from 'lucide-react';
import { EmailClassification, StepNumber, WorkspaceUser } from '../types';
import { ClassificationTable } from './ClassificationTable';

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  classifications?: EmailClassification[];
}

interface AgentChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isProcessing: boolean;
  currentStep: StepNumber;
  onSelectDraftForPreview: (item: EmailClassification) => void;
  user: WorkspaceUser | null;
}

export const AgentChat: React.FC<AgentChatProps> = ({
  messages,
  onSendMessage,
  isProcessing,
  currentStep,
  onSelectDraftForPreview,
  user,
}) => {
  const [inputText, setInputText] = useState(
    'Use the Gmail MCP tool to look up the last ten unread emails in my inbox. Review each email body to evaluate if it represents an urgent system issue, a high-priority bug report, or an active customer request'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;
    onSendMessage(inputText);
  };

  const handleApplyPreset = () => {
    const defaultPrompt =
      'Use the Gmail MCP tool to look up the last ten unread emails in my inbox. Review each email body to evaluate if it represents an urgent system issue, a high-priority bug report, or an active customer request';
    setInputText(defaultPrompt);
    onSendMessage(defaultPrompt);
  };

  return (
    <div className="bg-[#090909] border border-[#222] rounded-xl flex flex-col h-full overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-3.5 border-b border-[#222] flex items-center justify-between bg-[#0F0F0F]">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-[#00F0FF] flex items-center justify-center text-black font-black">
            <Bot className="w-3.5 h-3.5 text-black" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Input: Agent Manager</h3>
            <p className="text-[10px] text-[#666] font-mono">Antigravity 2.0 Loop</p>
          </div>
        </div>
        {messages.length <= 1 && (
          <button
            id="apply-preset-prompt"
            onClick={handleApplyPreset}
            className="text-[10px] font-bold uppercase tracking-widest bg-[#00F0FF] text-black hover:brightness-110 px-3 py-1.5 rounded flex items-center gap-1.5 transition-all glow-cyan-sm"
          >
            <Sparkles className="w-3 h-3 text-black" /> Run Step 2 Instruction
          </button>
        )}
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'agent' && (
              <div className="w-7 h-7 rounded bg-[#00F0FF] flex-shrink-0 flex items-center justify-center text-black font-bold mt-0.5 glow-cyan-sm">
                <Bot className="w-4 h-4 text-black" />
              </div>
            )}

            <div
              className={`max-w-[88%] rounded-lg p-4 text-xs font-sans ${
                msg.sender === 'user'
                  ? 'bg-[#181818] text-white border border-[#333] rounded-tr-none'
                  : 'bg-[#121212] text-[#ddd] border border-[#222] rounded-tl-none shadow-inner'
              }`}
            >
              <div className="flex items-center justify-between gap-4 mb-2 text-[10px] font-mono opacity-60">
                <span className="font-bold uppercase tracking-widest text-[#00F0FF]">
                  {msg.sender === 'user' ? user?.displayName || 'Keilah' : 'Antigravity Agent'}
                </span>
                <span>{msg.timestamp}</span>
              </div>

              <div className="leading-relaxed whitespace-pre-wrap">{msg.text}</div>

              {msg.classifications && (
                <ClassificationTable
                  classifications={msg.classifications}
                  onSelectDraftForPreview={onSelectDraftForPreview}
                />
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded bg-[#222] border border-[#444] flex-shrink-0 flex items-center justify-center text-[#00F0FF] font-bold text-xs mt-0.5">
                {user?.displayName?.[0] || 'K'}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-[#222] bg-[#0C0C0C]">
        <div className="relative flex items-center">
          <input
            id="agent-chat-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Direct the Antigravity agent..."
            disabled={isProcessing}
            className="w-full bg-[#141414] border border-[#222] rounded py-2.5 pl-3.5 pr-10 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#00F0FF] transition-colors font-sans"
          />
          <button
            id="send-agent-message"
            type="submit"
            disabled={isProcessing || !inputText.trim()}
            className="absolute right-2 text-black bg-[#00F0FF] hover:bg-[#33f3ff] disabled:opacity-40 p-1.5 rounded transition-all font-bold"
            title="Send Instruction"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex items-center justify-between text-[10px] text-[#555] font-mono mt-2 px-1 uppercase tracking-wider">
          <span>Antigravity Agentic Loop</span>
          <span>Press Enter to dispatch</span>
        </div>
      </form>
    </div>
  );
};
