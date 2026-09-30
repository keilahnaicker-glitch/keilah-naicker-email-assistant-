import React from 'react';
import { Mail, Settings, Server, ShieldCheck, ToggleLeft, ToggleRight, Sparkles, RefreshCw, Key } from 'lucide-react';

interface McpsPanelProps {
  useSampleData: boolean;
  setUseSampleData: (val: boolean) => void;
  isGwsAuthenticated: boolean;
  userEmail: string;
  onRefreshUnread: () => void;
  isRefreshing: boolean;
}

export const McpsPanel: React.FC<McpsPanelProps> = ({
  useSampleData,
  setUseSampleData,
  isGwsAuthenticated,
  userEmail,
  onRefreshUnread,
  isRefreshing,
}) => {
  return (
    <div id="mcp-server-panel" className="bg-[#090909] border border-[#222] rounded-xl p-5 text-xs space-y-4 font-mono">
      <div className="flex items-center justify-between pb-2.5 border-b border-[#222]">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-[#00F0FF]" />
          <h3 className="font-bold text-[#888] text-xs uppercase tracking-widest">MCP Server Config</h3>
        </div>
        <span className="text-[9px] bg-[#141414] text-[#00F0FF] border border-[#333] px-2 py-0.5 rounded font-bold uppercase tracking-widest">
          gws-gmail_v2
        </span>
      </div>

      {/* Server Status Details */}
      <div className="bg-[#0F0F0F] p-3 rounded border border-[#222] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span className="font-bold text-white text-xs">gws-gmail</span>
          </div>
          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
            isGwsAuthenticated ? 'bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
          }`}>
            {isGwsAuthenticated ? 'AUTHENTICATED' : 'OAUTH REQUIRED'}
          </span>
        </div>

        <div className="text-[11px] text-[#888] space-y-1.5 pt-2 border-t border-[#1A1A1A]">
          <div className="flex justify-between">
            <span className="text-[#555]">Target Account:</span>
            <span className="text-white">{userEmail}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#555]">Scope Granted:</span>
            <span className="text-[#00F0FF]">readonly, compose</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#555]">LLM Core:</span>
            <span className="text-white font-bold">gemini-3.6-flash</span>
          </div>
        </div>
      </div>

      {/* Data Source Toggle */}
      <div className="bg-[#0F0F0F] p-3 rounded border border-[#222] space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold text-white text-xs uppercase tracking-tight">Sample Data Mode</div>
            <div className="text-[10px] text-[#666] font-sans">Inject 5 realistic urgent system & bug emails</div>
          </div>
          <button
            id="sample-data-toggle"
            onClick={() => setUseSampleData(!useSampleData)}
            className="text-[#00F0FF] hover:brightness-125 transition-all"
            title="Toggle Sample Data"
          >
            {useSampleData ? (
              <ToggleRight className="w-7 h-7 text-[#00F0FF]" />
            ) : (
              <ToggleLeft className="w-7 h-7 text-[#444]" />
            )}
          </button>
        </div>

        {!useSampleData && (
          <div className="pt-2 border-t border-[#1A1A1A]">
            <button
              id="refresh-unread-button"
              onClick={onRefreshUnread}
              disabled={isRefreshing}
              className="w-full bg-[#1A1A1A] hover:bg-[#222] text-[#00F0FF] text-[10px] font-bold py-2 px-3 rounded flex items-center justify-center gap-2 transition-all uppercase tracking-wider border border-[#333]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#00F0FF]' : ''}`} />
              Query Live Gmail Inbox Now
            </button>
          </div>
        )}
      </div>

      {/* Exposed Tools */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-bold text-[#666] uppercase tracking-widest px-1">Exposed MCP Tools:</div>
        <div className="space-y-1 text-[11px]">
          <div className="bg-[#0F0F0F] px-3 py-1.5 rounded border border-[#1A1A1A] flex items-center justify-between">
            <span className="text-[#00F0FF] font-bold">gws-gmail.list_unread_emails</span>
            <span className="text-[9px] text-[#555]">q: "is:unread"</span>
          </div>
          <div className="bg-[#0F0F0F] px-3 py-1.5 rounded border border-[#1A1A1A] flex items-center justify-between">
            <span className="text-[#00F0FF] font-bold">gws-gmail.classify_urgency</span>
            <span className="text-[9px] text-[#555]">Gemini Flash</span>
          </div>
          <div className="bg-[#0F0F0F] px-3 py-1.5 rounded border border-[#1A1A1A] flex items-center justify-between">
            <span className="text-[#00F0FF] font-bold">gws-gmail.insert_gmail_draft</span>
            <span className="text-[9px] text-[#555]">Draft API</span>
          </div>
        </div>
      </div>
    </div>
  );
};
