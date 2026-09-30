import React from 'react';
import { Cpu, CheckCircle2, ShieldCheck, Mail, Sparkles } from 'lucide-react';
import { StepNumber, WorkspaceUser } from '../types';

interface HeaderProps {
  currentStep: StepNumber;
  setStep: (step: StepNumber) => void;
  user: WorkspaceUser | null;
  needsAuth: boolean;
  onLogin: () => void;
  onLogout: () => void;
  isGwsAuthenticated: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  setStep,
  user,
  needsAuth,
  onLogin,
  onLogout,
  isGwsAuthenticated,
}) => {
  const steps: { num: StepNumber; label: string }[] = [
    { num: 1, label: 'Workspace Setup' },
    { num: 2, label: 'Scoped Query' },
    { num: 3, label: 'Approve Intent' },
    { num: 4, label: 'Classification' },
    { num: 5, label: 'Draft Assembly' },
    { num: 6, label: 'Gmail Insertion' },
  ];

  return (
    <header className="bg-[#0C0C0C] border-b border-[#222] text-slate-100 shadow-2xl">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-md bg-[#00F0FF] flex items-center justify-center text-black font-black text-lg glow-cyan-sm">
            A
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black tracking-tighter italic uppercase text-white">
                Antigravity <span className="not-italic text-xs px-2.5 py-0.5 rounded-sm bg-[#1A1A1A] text-[#00F0FF] font-mono border border-[#333]">v2.0_desktop</span>
              </h1>
            </div>
            <p className="text-[11px] text-[#666] flex items-center gap-2 font-mono">
              <span>Agentic Automation</span>
              <span className="text-[#333]">•</span>
              <span className="text-[#00F0FF]/80">gws-gmail MCP</span>
            </p>
          </div>
        </div>

        {/* MCP Status & Account */}
        <div className="flex items-center gap-4">
          {/* MCP Server Badge */}
          <div id="mcp-server-status" className="px-3 py-1.5 bg-[#141414] border border-[#222] rounded-md text-[11px] font-mono tracking-wider text-[#00F0FF] flex items-center gap-2.5">
            <span className={`w-2 h-2 rounded-full ${isGwsAuthenticated ? 'bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]' : 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'}`}></span>
            <span className="text-[#888]">GWS-GMAIL:</span>
            <span className="font-bold text-white uppercase">{isGwsAuthenticated ? 'AUTHENTICATED' : 'PENDING'}</span>
          </div>

          {/* User Sign In / User Profile */}
          {needsAuth ? (
            <button
              id="header-sign-in-button"
              onClick={onLogin}
              className="flex items-center gap-2 bg-[#00F0FF] hover:bg-[#33f3ff] text-black font-bold text-xs px-4 py-2 rounded uppercase tracking-wider transition-all glow-cyan-sm"
            >
              <Mail className="w-3.5 h-3.5" />
              Sign In With Google
            </button>
          ) : (
            <div className="flex items-center gap-3 pl-3 border-l border-[#222]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00F0FF] to-[#7000FF] flex items-center justify-center text-black font-bold text-xs shadow-md">
                {user?.displayName?.[0] || 'K'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-white tracking-tight">{user?.displayName || 'Keilah Naicker'}</div>
                <div className="text-[10px] text-[#666] font-mono">{user?.email || 'keilahnaicker@gmail.com'}</div>
              </div>
              <button
                onClick={onLogout}
                className="text-[10px] text-[#666] hover:text-[#00F0FF] font-mono px-2 py-1 rounded bg-[#141414] border border-[#222] uppercase tracking-wider hover:border-[#00F0FF]/40 transition-colors"
                title="Sign Out"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Step Stepper Navigation */}
      <div className="border-t border-[#1A1A1A] bg-[#090909]">
        <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {steps.map((step) => {
            const isActive = currentStep === step.num;
            const isCompleted = currentStep > step.num;
            return (
              <button
                key={step.num}
                id={`step-nav-${step.num}`}
                onClick={() => setStep(step.num)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-mono transition-all whitespace-nowrap uppercase tracking-wider ${
                  isActive
                    ? 'bg-[#141414] text-[#00F0FF] border border-[#00F0FF]/50 shadow-[0_0_10px_rgba(0,240,255,0.15)]'
                    : isCompleted
                    ? 'text-slate-300 hover:text-white bg-[#0f0f0f] border border-[#222]'
                    : 'text-[#555] hover:text-[#888] border border-transparent'
                }`}
              >
                <span className={`w-4 h-4 rounded text-[10px] flex items-center justify-center font-bold ${
                  isActive
                    ? 'bg-[#00F0FF] text-black'
                    : isCompleted
                    ? 'bg-[#1a1a1a] text-[#00F0FF] border border-[#333]'
                    : 'bg-[#1a1a1a] text-[#444]'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-3 h-3 text-[#00F0FF]" /> : step.num}
                </span>
                <span className={isActive ? 'font-bold' : ''}>{step.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
