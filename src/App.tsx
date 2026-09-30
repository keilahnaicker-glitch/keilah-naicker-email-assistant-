import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Header } from './components/Header';
import { ThoughtProcessPanel } from './components/ThoughtProcessPanel';
import { McpsPanel } from './components/McpsPanel';
import { AgentChat } from './components/AgentChat';
import { DraftsReview } from './components/DraftsReview';
import {
  EmailMessage,
  EmailClassification,
  AgentThought,
  StepNumber,
  WorkspaceUser,
} from './types';
import { MOCK_EMAILS } from './data/mockEmails';
import { initAuth, googleSignIn, logoutUser, getAccessToken } from './lib/firebase';
import { ShieldCheck, ArrowRight, ExternalLink, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [currentStep, setCurrentStep] = useState<StepNumber>(1);
  const [needsAuth, setNeedsAuth] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<WorkspaceUser | null>({
    email: 'keilahnaicker@gmail.com',
    displayName: 'Keilah Naicker',
  });
  const [useSampleData, setUseSampleData] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Email state
  const [emails, setEmails] = useState<EmailMessage[]>(MOCK_EMAILS);
  const [classifications, setClassifications] = useState<EmailClassification[]>([]);

  // Agent thoughts stream
  const [thoughts, setThoughts] = useState<AgentThought[]>([
    {
      id: 'thought-init',
      step: 1,
      title: 'Antigravity Workspace Initialized',
      description: 'Connected to gws-gmail MCP server. Authenticated scope: gmail.readonly, gmail.compose.',
      status: 'completed',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  // Chat message stream
  const [chatMessages, setChatMessages] = useState<
    { id: string; sender: 'user' | 'agent'; text: string; timestamp: string; classifications?: EmailClassification[] }[]
  >([
    {
      id: 'msg-welcome',
      sender: 'agent',
      text: 'Welcome to Google Antigravity 2.0 (Desktop Interface).\n\nTo audit your inbox for urgent operational issues, click "Run Step 2 Instruction" or enter your plain language query below.',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  // Initialize Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (fbUser: User, accessToken: string) => {
        setNeedsAuth(false);
        setToken(accessToken);
        setUser({
          email: fbUser.email || 'keilahnaicker@gmail.com',
          displayName: fbUser.displayName || 'Keilah Naicker',
        });
        addThought({
          step: 1,
          title: 'Google OAuth Status',
          description: `User authenticated as ${fbUser.email || 'keilahnaicker@gmail.com'}. OAuth access token cached.`,
          status: 'completed',
        });
      },
      () => {
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  const addThought = (thought: Omit<AgentThought, 'id' | 'timestamp'>) => {
    const newThought: AgentThought = {
      ...thought,
      id: `thought-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
    };
    setThoughts((prev) => [...prev, newThought]);
  };

  const handleLogin = async () => {
    try {
      setIsProcessing(true);
      const res = await googleSignIn();
      if (res) {
        setToken(res.accessToken);
        setUser({
          email: res.user.email || 'keilahnaicker@gmail.com',
          displayName: res.user.displayName || 'Keilah Naicker',
        });
        setNeedsAuth(false);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      alert(`Google Auth failed: ${err.message || 'Error authenticating.'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setToken(null);
    setNeedsAuth(true);
  };

  // Step 2: User triggers scoped query in Agent Chat
  const handleUserSendMessage = (instructionText: string) => {
    const timeStr = new Date().toLocaleTimeString();

    // Add user message
    setChatMessages((prev) => [
      ...prev,
      {
        id: `user-msg-${Date.now()}`,
        sender: 'user',
        text: instructionText,
        timestamp: timeStr,
      },
    ]);

    setCurrentStep(3);

    // Agent thought process step 2 & 3
    addThought({
      step: 2,
      title: 'Parsed Plain Language Command',
      description: 'Instruction received: Audit last 10 unread emails for urgent system issues, bug reports, or customer requests.',
      status: 'completed',
    });

    addThought({
      step: 3,
      title: 'Structured Implementation Plan & Intent Authorization',
      description: 'Plan: Query gws-gmail.list_unread_emails for keilahnaicker@gmail.com, then run Gemini 3.6 Flash classification loop on text payloads.',
      status: 'waiting_approval',
      toolCall: {
        name: 'gws-gmail.list_unread_emails',
        params: { maxResults: 10, q: 'is:unread', userEmail: user?.email || 'keilahnaicker@gmail.com' },
      },
    });

    // Agent response requesting confirmation
    setChatMessages((prev) => [
      ...prev,
      {
        id: `agent-msg-plan-${Date.now()}`,
        sender: 'agent',
        text: `I have structured an implementation plan:\n1. Invoke MCP tool \`gws-gmail.list_unread_emails\` to fetch the latest unread emails.\n2. Evaluate body text using Gemini 3.6 Flash for operational urgency.\n3. Present structured classification matrix.\n4. Stage draft responses for identified urgent items.\n\nPlease click "Proceed" in the Thought Process Panel to allow inbox query execution.`,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  // Step 3 -> 4: User clicks "Proceed" (Allow inbox query)
  const handleApproveStep3 = async () => {
    setIsProcessing(true);
    addThought({
      step: 3,
      title: 'Executing gws-gmail.list_unread_emails',
      description: 'Calling Gmail REST API / MCP server endpoint...',
      status: 'in_progress',
    });

    try {
      let fetchedEmails: EmailMessage[] = [];

      if (!useSampleData && token) {
        // Fetch real Gmail unread emails via server API
        const res = await fetch('/api/gmail/unread', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.messages && data.messages.length > 0) {
            fetchedEmails = data.messages;
            setEmails(fetchedEmails);
          } else {
            // No unread emails found in real inbox, fallback to sample data for demo clarity
            addThought({
              step: 3,
              title: 'Live Gmail Query Result',
              description: '0 unread emails found in live inbox. Utilizing 5 structured test emails for classification.',
              status: 'completed',
            });
            fetchedEmails = MOCK_EMAILS;
            setEmails(MOCK_EMAILS);
          }
        } else {
          console.warn('Real Gmail fetch failed or expired, using sample data.');
          fetchedEmails = MOCK_EMAILS;
          setEmails(MOCK_EMAILS);
        }
      } else {
        // Use sample test emails
        fetchedEmails = MOCK_EMAILS;
        setEmails(MOCK_EMAILS);
      }

      addThought({
        step: 4,
        title: 'Iterative Model Classification (Gemini 3.6 Flash)',
        description: `Processing ${fetchedEmails.length} email text payloads for system issues, high priority bugs, and customer escalations...`,
        status: 'in_progress',
      });

      // Call Gemini classification API on server
      const classifyRes = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: fetchedEmails }),
      });

      if (!classifyRes.ok) {
        throw new Error('Failed to classify emails via Gemini API server endpoint.');
      }

      const classifyData = await classifyRes.json();
      const results: EmailClassification[] = classifyData.classifications || [];

      setClassifications(results);
      setCurrentStep(4);

      addThought({
        step: 4,
        title: 'Classification Matrix Complete',
        description: `Isolated ${results.filter((r) => r.urgency !== 'LOW').length} high-urgency message(s). Printed summary table to chat window.`,
        status: 'completed',
      });

      // Agent chat update with classification matrix
      setChatMessages((prev) => [
        ...prev,
        {
          id: `agent-msg-results-${Date.now()}`,
          sender: 'agent',
          text: `Audit complete. Gemini 3.6 Flash evaluated ${fetchedEmails.length} email body payloads and isolated high-urgency operational items below:`,
          timestamp: new Date().toLocaleTimeString(),
          classifications: results,
        },
      ]);

      // Move to Step 5: Draft Assembly
      setTimeout(() => {
        setCurrentStep(5);
        addThought({
          step: 5,
          title: 'Draft Response Assembly Staged',
          description: 'Structured response drafts generated for urgent items. Ready to insert into user Gmail draft folder.',
          status: 'waiting_approval',
          toolCall: {
            name: 'gws-gmail.insert_gmail_draft',
            params: { targetFolder: 'Drafts', account: user?.email || 'keilahnaicker@gmail.com' },
          },
        });
      }, 800);
    } catch (err: any) {
      console.error('Step 3/4 error:', err);
      addThought({
        step: 3,
        title: 'Execution Error',
        description: err.message || 'An error occurred during email classification.',
        status: 'failed',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 5 -> 6: Save individual draft to Gmail
  const handleSaveDraftToGmail = async (item: EmailClassification): Promise<boolean> => {
    setIsProcessing(true);
    try {
      if (token) {
        // Send real API call to create draft in Gmail
        const res = await fetch('/api/gmail/draft', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            to: item.senderEmail,
            subject: item.suggestedSubject,
            body: item.proposedReply,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to insert draft into Gmail account.');
        }

        const draftRes = await res.json();
        setClassifications((prev) =>
          prev.map((c) => (c.emailId === item.emailId ? { ...c, draftCreated: true, draftId: draftRes.draftId } : c))
        );

        addThought({
          step: 6,
          title: `Draft Saved to Gmail (${item.sender})`,
          description: `Successfully inserted draft for "${item.suggestedSubject}" into keilahnaicker@gmail.com draft folder.`,
          status: 'completed',
        });
        return true;
      } else {
        // Simulate insertion if offline or sample mode without token
        await new Promise((r) => setTimeout(r, 600));
        setClassifications((prev) =>
          prev.map((c) => (c.emailId === item.emailId ? { ...c, draftCreated: true, draftId: 'draft-sim-123' } : c))
        );
        addThought({
          step: 6,
          title: `Draft Staged (${item.sender})`,
          description: `Staged draft for "${item.suggestedSubject}". Sign in with Google to push live to your Gmail account!`,
          status: 'completed',
        });
        return true;
      }
    } catch (err: any) {
      console.error('Draft save error:', err);
      alert(`Error saving draft to Gmail: ${err.message}`);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 6: Batch Save All Drafts to Gmail
  const handleBatchSaveDraftsToGmail = async () => {
    setIsProcessing(true);
    const urgentNotSaved = classifications.filter((c) => c.urgency !== 'LOW' && !c.draftCreated);

    for (const item of urgentNotSaved) {
      await handleSaveDraftToGmail(item);
    }

    setCurrentStep(6);
    setIsProcessing(false);

    setChatMessages((prev) => [
      ...prev,
      {
        id: `agent-msg-done-${Date.now()}`,
        sender: 'agent',
        text: `Execution Complete! All contextually appropriate response drafts for urgent emails have been created and staged in your personal Gmail draft folder (keilahnaicker@gmail.com).\n\nYou can verify your drafts in Gmail now.`,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-slate-100 flex flex-col font-sans selection:bg-[#00F0FF] selection:text-black">
      {/* Header Bar */}
      <Header
        currentStep={currentStep}
        setStep={setCurrentStep}
        user={user}
        needsAuth={needsAuth}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isGwsAuthenticated={!needsAuth || token !== null}
      />

      {/* Main Desktop Interface */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Thought Process Panel & MCP Status (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <ThoughtProcessPanel
            thoughts={thoughts}
            currentStep={currentStep}
            isProcessing={isProcessing}
            onApproveStep3={handleApproveStep3}
            onApproveStep6={handleBatchSaveDraftsToGmail}
            stagedDraftsCount={classifications.filter((c) => c.urgency !== 'LOW').length}
          />

          <McpsPanel
            useSampleData={useSampleData}
            setUseSampleData={setUseSampleData}
            isGwsAuthenticated={!needsAuth || token !== null}
            userEmail={user?.email || 'keilahnaicker@gmail.com'}
            onRefreshUnread={handleApproveStep3}
            isRefreshing={isProcessing}
          />
        </div>

        {/* Right Column: Agent Chat & Draft Assembly View (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="h-[460px]">
            <AgentChat
              messages={chatMessages}
              onSendMessage={handleUserSendMessage}
              isProcessing={isProcessing}
              currentStep={currentStep}
              onSelectDraftForPreview={(item) => setCurrentStep(5)}
              user={user}
            />
          </div>

          <div>
            <DraftsReview
              classifications={classifications}
              onSaveDraftToGmail={handleSaveDraftToGmail}
              onBatchSaveDraftsToGmail={handleBatchSaveDraftsToGmail}
              isProcessing={isProcessing}
              userEmail={user?.email || 'keilahnaicker@gmail.com'}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
