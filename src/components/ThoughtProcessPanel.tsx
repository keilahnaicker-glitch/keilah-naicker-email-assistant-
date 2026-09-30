import React from 'react';
import { Terminal, ShieldAlert, Play, CheckCircle2, AlertCircle, ArrowRight, Loader2, Sparkles, Database } from 'lucide-react';
import { AgentThought, StepNumber } from '../types';

interface ThoughtProcessPanelProps {
  thoughts: AgentThought[];
  currentStep: StepNumber;
  isProcessing: boolean;
  onApproveStep3: () => void;
  onApproveStep6: () => void;
  stagedDraftsCount: number;
}

export const ThoughtProcessPanel: React.FC<ThoughtProcessPanelProps> = ({
  thoughts,
  currentStep,
  isProcessing,
  onApproveStep3,
  onApproveStep6,
  stagedDraftsCount,
}) => {
  return (
    <div id="thought-process-panel" className="bg-[#090909] border border-[#222] rounded-xl p-5 shadow-2xl flex flex-col h-full font-mono">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#222] mb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#00F0FF]" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#888]">Thought Process</h2>
        </div>
        <span className="text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded bg-[#141414] text-[#00F0FF] border border-[#333] flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-pulse"></span>
          Active Agent
        </span>
      </div>

      {/* Thought Stream */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs no-scrollbar">
        {thoughts.length === 0 ? (
          <div className="text-[#555] py-8 text-center italic text-[11px]">
            Waiting for agent instruction... Enter a query in the Agent Manager chat.
          </div>
        ) : (
          thoughts.map((thought) => (
            <div
              key={thought.id}
              className={`p-3 rounded transition-all text-[11px] ${
                thought.status === 'in_progress'
                  ? 'bg-[#111] border-l-2 border-[#00F0FF] text-white shadow-md'
                  : thought.status === 'waiting_approval'
                  ? 'bg-[#141414] border-l-2 border-amber-400 text-amber-200'
                  : thought.status === 'completed'
                  ? 'bg-[#111] border border-[#222] text-[#888]'
                  : 'bg-[#0A0A0A] border border-[#1A1A1A] text-[#555]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {thought.status === 'in_progress' && (
                    <Loader2 className="w-3.5 h-3.5 text-[#00F0FF] animate-spin" />
                  )}
                  {thought.status === 'waiting_approval' && (
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  )}
                  {thought.status === 'completed' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00F0FF]" />
                  )}
                  <span className="font-bold text-xs uppercase tracking-tight text-white">{thought.title}</span>
                </div>
                <span className="text-[10px] text-[#555]">{thought.timestamp}</span>
              </div>

              <p className="text-[#aaa] text-[11px] leading-relaxed mb-2 font-sans">
                {thought.description}
              </p>

              {thought.toolCall && (
                <div className="bg-[#080808] p-2.5 rounded font-mono text-[10px] border border-[#222] text-[#00F0FF] mb-2">
                  <div className="text-[#555] flex items-center gap-1 mb-1 text-[9px] uppercase tracking-widest">
                    <Database className="w-3 h-3 text-[#00F0FF]" /> MCP Tool Target:
                  </div>
                  <div className="text-white font-bold">{thought.toolCall.name}</div>
                  <pre className="text-[#777] text-[10px] mt-1 overflow-x-auto">
                    {JSON.stringify(thought.toolCall.params, null, 2)}
                  </pre>
                </div>
              )}

              {thought.details && (
                <div className="text-[10px] text-[#777] bg-[#0A0A0A] p-2 rounded border border-[#1A1A1A]">
                  {thought.details}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Action Approval Bar */}
      <div className="mt-3 pt-3 border-t border-[#222]">
        {currentStep === 3 && (
          <div className="bg-[#111] border border-[#00F0FF]/40 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 font-bold text-xs text-[#00F0FF] uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-[#00F0FF]" />
                Permission Required
              </div>
              <span className="text-[9px] bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 px-2 py-0.5 rounded uppercase tracking-widest">
                Intent Approval
              </span>
            </div>
            <p className="text-[11px] text-[#aaa] mb-3 leading-snug font-sans">
              Agent requests permission to invoke <code className="bg-[#000] px-1.5 py-0.5 rounded text-[#00F0FF] font-mono">gws-gmail.list_unread_emails</code> for user keilahnaicker@gmail.com.
            </p>
            <button
              id="proceed-step3-button"
              onClick={onApproveStep3}
              disabled={isProcessing}
              className="w-full bg-[#00F0FF] hover:bg-[#33f3ff] text-black font-black text-xs py-2.5 px-3 rounded flex items-center justify-center gap-2 transition-all uppercase tracking-[0.2em] shadow-[0_0_12px_rgba(0,240,255,0.3)]"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Querying Inbox...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" /> Proceed
                </>
              )}
            </button>
          </div>
        )}

        {currentStep === 5 && (
          <div className="bg-[#111] border border-[#00F0FF]/40 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 font-bold text-xs text-[#00F0FF] uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-[#00F0FF]" />
                Execute Draft Insertion
              </div>
              <span className="text-[9px] bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 px-2 py-0.5 rounded uppercase tracking-widest">
                {stagedDraftsCount} Draft(s) Ready
              </span>
            </div>
            <p className="text-[11px] text-[#aaa] mb-3 leading-snug font-sans">
              Agent is ready to insert contextually structured response drafts directly into Gmail draft folder for keilahnaicker@gmail.com.
            </p>
            <button
              id="proceed-step6-button"
              onClick={onApproveStep6}
              disabled={isProcessing || stagedDraftsCount === 0}
              className="w-full bg-[#00F0FF] hover:bg-[#33f3ff] text-black font-black text-xs py-2.5 px-3 rounded flex items-center justify-center gap-2 transition-all uppercase tracking-[0.2em] shadow-[0_0_12px_rgba(0,240,255,0.3)] disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Staging to Gmail...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" /> Execute Draft Insertion
                </>
              )}
            </button>
          </div>
        )}

        {currentStep === 6 && (
          <div className="bg-[#111] border border-[#00F0FF]/40 rounded-lg p-3 text-white">
            <div className="flex items-center gap-2 text-xs font-bold text-[#00F0FF] uppercase tracking-wider mb-1">
              <CheckCircle2 className="w-4 h-4 text-[#00F0FF]" /> Drafts Staged in Gmail
            </div>
            <p className="text-[11px] text-[#aaa] mb-2 font-sans">
              Verified: Contextually structured replies are staged in your personal Gmail draft folder and ready for transmission.
            </p>
            <a
              href="https://mail.google.com/mail/u/0/#drafts"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#00F0FF] hover:underline font-bold uppercase tracking-wider"
            >
              Open Gmail Drafts Folder <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
