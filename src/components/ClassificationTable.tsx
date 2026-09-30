import React from 'react';
import { AlertTriangle, Bug, UserCheck, Info, Sparkles, CheckCircle2 } from 'lucide-react';
import { EmailClassification, UrgencyType } from '../types';

interface ClassificationTableProps {
  classifications: EmailClassification[];
  onSelectDraftForPreview?: (classification: EmailClassification) => void;
}

export const ClassificationTable: React.FC<ClassificationTableProps> = ({
  classifications,
  onSelectDraftForPreview,
}) => {
  const getUrgencyBadge = (urgency: UrgencyType, label: string) => {
    switch (urgency) {
      case 'CRITICAL_SYSTEM':
        return (
          <span className="inline-flex items-center gap-1 bg-[#141414] text-[#FF3E00] border border-[#FF3E00]/40 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider whitespace-nowrap">
            <AlertTriangle className="w-3 h-3 text-[#FF3E00]" />
            {label || 'Critical System'}
          </span>
        );
      case 'HIGH_BUG':
        return (
          <span className="inline-flex items-center gap-1 bg-[#141414] text-[#FFAA00] border border-[#FFAA00]/40 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider whitespace-nowrap">
            <Bug className="w-3 h-3 text-[#FFAA00]" />
            {label || 'High Priority Bug'}
          </span>
        );
      case 'ACTIVE_CUSTOMER':
        return (
          <span className="inline-flex items-center gap-1 bg-[#141414] text-[#00F0FF] border border-[#00F0FF]/40 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider whitespace-nowrap">
            <UserCheck className="w-3 h-3 text-[#00F0FF]" />
            {label || 'Customer Request'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-[#141414] text-[#666666] border border-[#222] px-2 py-0.5 rounded text-[10px] uppercase tracking-wider whitespace-nowrap">
            <Info className="w-3 h-3 text-[#555]" />
            Low Priority
          </span>
        );
    }
  };

  const urgentItems = classifications.filter((c) => c.urgency !== 'LOW');

  return (
    <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-5 my-3 text-xs space-y-3 font-mono shadow-inner">
      <div className="flex items-center justify-between pb-3 border-b border-[#222]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#00F0FF]" />
          <h4 className="font-bold uppercase tracking-tighter text-white text-sm">Classification Summary</h4>
        </div>
        <span className="text-[10px] font-mono text-[#00F0FF] bg-[#141414] px-2.5 py-0.5 rounded border border-[#333] uppercase tracking-widest font-bold">
          {urgentItems.length} Flagged Item(s)
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-[#222] text-[#666] font-mono text-[10px] uppercase tracking-widest">
              <th className="pb-3 px-2 font-bold">Category</th>
              <th className="pb-3 px-2 font-bold">Originator</th>
              <th className="pb-3 px-2 font-bold">Subject / Summary</th>
              <th className="pb-3 px-2 font-bold">Rationale</th>
              <th className="pb-3 px-2 text-right font-bold">Draft Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1A1A1A]">
            {classifications.map((item) => (
              <tr key={item.emailId} className="hover:bg-[#121212] transition-colors">
                <td className="py-3 px-2 align-top">
                  {getUrgencyBadge(item.urgency, item.urgencyLabel)}
                </td>
                <td className="py-3 px-2 align-top font-bold text-white max-w-[140px] truncate">
                  {item.sender}
                </td>
                <td className="py-3 px-2 align-top max-w-[220px]">
                  <div className="font-bold text-[#eee] truncate">{item.subject}</div>
                  <div className="text-[10px] text-[#777] mt-0.5 line-clamp-2 font-sans">{item.summary}</div>
                </td>
                <td className="py-3 px-2 align-top text-[#888] max-w-[200px] font-sans text-[11px]">
                  <div className="leading-snug">{item.reason}</div>
                </td>
                <td className="py-3 px-2 align-top text-right">
                  {item.urgency !== 'LOW' ? (
                    item.draftCreated ? (
                      <span className="inline-flex items-center gap-1 text-[#00F0FF] font-mono text-[10px] bg-[#141414] px-2 py-1 rounded border border-[#00F0FF]/30 uppercase tracking-widest font-bold">
                        <CheckCircle2 className="w-3 h-3 text-[#00F0FF]" /> Staged
                      </span>
                    ) : (
                      <button
                        onClick={() => onSelectDraftForPreview && onSelectDraftForPreview(item)}
                        className="text-[#00F0FF] hover:underline text-[11px] font-bold uppercase tracking-wider"
                      >
                        Review Draft
                      </button>
                    )
                  ) : (
                    <span className="text-[#444] text-[10px] uppercase tracking-wider font-mono">Ignored</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
