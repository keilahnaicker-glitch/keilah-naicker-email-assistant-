import React, { useState } from 'react';
import { Mail, Edit3, Send, CheckCircle2, AlertTriangle, ExternalLink, ShieldAlert, Sparkles, Loader2, Copy } from 'lucide-react';
import { EmailClassification } from '../types';

interface DraftsReviewProps {
  classifications: EmailClassification[];
  onSaveDraftToGmail: (classification: EmailClassification) => Promise<boolean>;
  onBatchSaveDraftsToGmail: () => Promise<void>;
  isProcessing: boolean;
  userEmail: string;
}

export const DraftsReview: React.FC<DraftsReviewProps> = ({
  classifications,
  onSaveDraftToGmail,
  onBatchSaveDraftsToGmail,
  isProcessing,
  userEmail,
}) => {
  const urgentItems = classifications.filter((item) => item.urgency !== 'LOW');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedDrafts, setEditedDrafts] = useState<Record<string, { subject: string; body: string }>>({});
  const [confirmModalItem, setConfirmModalItem] = useState<EmailClassification | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getDraftContent = (item: EmailClassification) => {
    return editedDrafts[item.emailId] || {
      subject: item.suggestedSubject,
      body: item.proposedReply,
    };
  };

  const handleTextChange = (emailId: string, field: 'subject' | 'body', val: string) => {
    setEditedDrafts((prev) => ({
      ...prev,
      [emailId]: {
        ...(prev[emailId] || {
          subject: classifications.find((c) => c.emailId === emailId)?.suggestedSubject || '',
          body: classifications.find((c) => c.emailId === emailId)?.proposedReply || '',
        }),
        [field]: val,
      },
    }));
  };

  const handleConfirmSingleInsert = async () => {
    if (!confirmModalItem) return;
    const currentContent = getDraftContent(confirmModalItem);
    const updatedClassification = {
      ...confirmModalItem,
      suggestedSubject: currentContent.subject,
      proposedReply: currentContent.body,
    };
    await onSaveDraftToGmail(updatedClassification);
    setConfirmModalItem(null);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-[#090909] border border-[#222] rounded-xl p-5 shadow-2xl space-y-4 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#222]">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-[#00F0FF]" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#888]">Draft Response Assembly</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[9px] bg-[#141414] text-[#00F0FF] border border-[#333] px-2.5 py-0.5 rounded font-bold uppercase tracking-widest">
            {urgentItems.length} Draft(s) Staged
          </span>
          <a
            href="https://mail.google.com/mail/u/0/#drafts"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-[#00F0FF] hover:underline flex items-center gap-1 font-bold uppercase tracking-widest"
          >
            Open Gmail <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {urgentItems.length === 0 ? (
        <div className="text-center py-8 text-[#555] text-xs italic bg-[#0F0F0F] rounded-lg border border-[#222]">
          No urgent items classified yet. Run the Agent Manager query to analyze inbox emails.
        </div>
      ) : (
        <div className="space-y-3">
          {urgentItems.map((item) => {
            const content = getDraftContent(item);
            const isEditing = editingId === item.emailId;

            return (
              <div
                key={item.emailId}
                className={`p-4 rounded-lg border transition-all ${
                  item.draftCreated
                    ? 'bg-[#0F0F0F] border-[#00F0FF]/40'
                    : 'bg-[#0F0F0F] border-[#222] hover:border-[#333]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{item.sender}</span>
                    <span className="text-[10px] text-[#666]">({item.senderEmail})</span>
                  </div>
                  {item.draftCreated ? (
                    <span className="text-[9px] bg-[#141414] text-[#00F0FF] border border-[#00F0FF]/40 px-2.5 py-1 rounded flex items-center gap-1 font-bold uppercase tracking-widest">
                      <CheckCircle2 className="w-3 h-3 text-[#00F0FF]" /> Inserted to Gmail
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingId(isEditing ? null : item.emailId)}
                        className="text-[10px] font-bold uppercase tracking-wider text-[#888] hover:text-white px-2.5 py-1 rounded bg-[#1A1A1A] border border-[#333] flex items-center gap-1 transition-colors"
                      >
                        <Edit3 className="w-3 h-3 text-[#00F0FF]" />
                        {isEditing ? 'Save' : 'Edit'}
                      </button>
                      <button
                        onClick={() => setConfirmModalItem(item)}
                        disabled={isProcessing}
                        className="text-[10px] bg-[#00F0FF] hover:bg-[#33f3ff] text-black font-black px-3 py-1 rounded uppercase tracking-wider flex items-center gap-1 transition-all glow-cyan-sm"
                      >
                        <Send className="w-3 h-3 text-black" /> Insert to Gmail
                      </button>
                    </div>
                  )}
                </div>

                {/* Subject Line */}
                <div className="mb-3">
                  <div className="text-[9px] text-[#666] font-bold uppercase tracking-widest mb-1">Proposed Subject:</div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={content.subject}
                      onChange={(e) => handleTextChange(item.emailId, 'subject', e.target.value)}
                      className="w-full bg-[#141414] border border-[#333] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#00F0FF] font-sans"
                    />
                  ) : (
                    <div className="font-bold text-xs text-[#eee] bg-[#141414] p-2 rounded border border-[#222]">
                      {content.subject}
                    </div>
                  )}
                </div>

                {/* Response Body */}
                <div>
                  <div className="flex items-center justify-between text-[9px] text-[#666] font-bold uppercase tracking-widest mb-1">
                    <span>Proposed Response Body:</span>
                    <button
                      onClick={() => copyToClipboard(content.body, item.emailId)}
                      className="text-[#888] hover:text-[#00F0FF] flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> {copiedId === item.emailId ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  {isEditing ? (
                    <textarea
                      rows={5}
                      value={content.body}
                      onChange={(e) => handleTextChange(item.emailId, 'body', e.target.value)}
                      className="w-full bg-[#141414] border border-[#333] rounded p-2.5 text-xs text-white focus:outline-none focus:border-[#00F0FF] font-sans leading-relaxed"
                    />
                  ) : (
                    <div className="whitespace-pre-wrap text-[11px] font-sans leading-relaxed text-[#ccc] bg-[#141414] p-3 rounded border border-[#222]">
                      {content.body}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModalItem && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0C0C0C] border-2 border-[#00F0FF] rounded-xl max-w-md w-full p-6 shadow-[0_0_30px_rgba(0,240,255,0.2)] space-y-4">
            <div className="flex items-center gap-2 text-[#00F0FF] font-bold text-sm uppercase tracking-widest">
              <ShieldAlert className="w-5 h-5 text-[#00F0FF]" />
              Confirm Draft Insertion
            </div>
            <p className="text-xs text-[#aaa] font-sans leading-relaxed">
              Are you sure you want to insert this draft response directly into the Gmail drafts folder for{' '}
              <strong className="text-white font-mono">{userEmail}</strong>?
            </p>

            <div className="bg-[#141414] p-3 rounded border border-[#222] text-xs space-y-1">
              <div className="text-[#888] text-[11px]">
                <strong>To:</strong> {confirmModalItem.sender} ({confirmModalItem.senderEmail})
              </div>
              <div className="text-white font-bold truncate">
                <strong>Subject:</strong> {getDraftContent(confirmModalItem).subject}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#222]">
              <button
                onClick={() => setConfirmModalItem(null)}
                className="px-4 py-2 rounded border border-[#333] text-xs text-[#888] hover:text-white uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSingleInsert}
                disabled={isProcessing}
                className="px-5 py-2 rounded bg-[#00F0FF] hover:bg-[#33f3ff] text-black font-black text-xs uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,240,255,0.3)]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Staging...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-black" /> Confirm & Insert
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
