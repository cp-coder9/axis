'use client';

import React, { useState, useEffect } from 'react';
import { OrigamiIcon } from '@/lib/origami-icons';
import { FeedbackRecord, ProjectEntity, RoleKey } from '@/lib/types';
import { INITIAL_FEEDBACK_RECORDS, ROLE_PROFILES } from '@/lib/data';
import { apiPost, ApiFeedbackResponse } from '@/lib/api';

interface FeedbackWidgetProps {
  currentRole: RoleKey;
  activeProject: ProjectEntity;
  activeToolName: string;
  activeTabLabel: string;
}

export const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({
  currentRole,
  activeProject,
  activeToolName,
  activeTabLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'submit' | 'records'>('submit');
  const [category, setCategory] = useState<'Bug' | 'Feature request' | 'Usability' | 'Praise'>('Feature request');
  const [text, setText] = useState('');
  const [records, setRecords] = useState<FeedbackRecord[]>(INITIAL_FEEDBACK_RECORDS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const feedbackCounter = React.useRef(100);

  const profile = ROLE_PROFILES[currentRole] || ROLE_PROFILES.architect;

  // Listen for Ctrl+Shift+F shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length < 10) {
      showToast('Please enter at least 10 characters.');
      return;
    }

    // PRD §6.3: submissions POST to the API (MariaDB-backed) with captured context
    const categoryKey = { Bug: 'bug', 'Feature request': 'feature_request', Usability: 'usability', Praise: 'praise' }[category];
    let serverId: string | null = null;
    try {
      const res = await apiPost<ApiFeedbackResponse>('/feedback', {
        category: categoryKey,
        body: text.trim(),
        context_project_id: activeProject?.id ?? null,
        context_module: activeToolName || null,
        context_tab: activeTabLabel || null,
      }, { role: currentRole, userId: 'user-demo-architect' });
      serverId = res.id;
    } catch {
      // API unreachable — keep the local record so the loop never silently drops feedback
    }

    feedbackCounter.current += 1;
    const newRecord: FeedbackRecord = {
      id: serverId ?? `fb-${feedbackCounter.current}`,
      title: text.trim().slice(0, 75) + (text.length > 75 ? '…' : ''),
      category,
      status: 'Received',
      date: 'Just now',
      context: `${activeProject.name} · ${activeToolName || 'Project Datum'} · ${activeTabLabel || 'Main'} · ${profile.label}`,
      description: text.trim(),
      severityScore: category === 'Bug' ? 8 : category === 'Usability' ? 6 : 4,
      sentiment: category === 'Praise' ? 'positive' : category === 'Bug' ? 'frustrated' : 'neutral',
    };

    setRecords([newRecord, ...records]);
    setText('');
    showToast(serverId
      ? 'Feedback submitted and automatically clustered into roadmap telemetry.'
      : 'Feedback captured locally — API unreachable, will need resubmission.');
    setIsOpen(false);
  };

  const capturedContext = `${activeProject.name} · ${activeToolName || 'Datum Canvas'} · ${activeTabLabel || 'Overview'} · ${profile.label}`;

  return (
    <>
      {/* Floating Action Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-6 bottom-6 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#19B7B0] to-[#167E79] text-white shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40"
        title="Send feedback (Ctrl+Shift+F)"
        aria-label="Open feedback intelligence"
      >
        <OrigamiIcon name="feedback" size={26} />
      </button>

      {/* Floating Feedback Dialog Panel */}
      {isOpen && (
        <div className="fixed right-6 bottom-24 w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-120px)] bg-white border border-[#102033]/15 rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="p-4 border-b border-[#102033]/10 flex items-center justify-between bg-[#fbfdfd]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#DFF5F2] flex items-center justify-center text-[#167E79]">
                <OrigamiIcon name="feedback" size={20} />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-[#102033]">Send Feedback</h3>
                <p className="text-[11px] text-[#657287]">Context is captured automatically</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-lg bg-[#102033]/5 text-[#657287] hover:text-[#102033] flex items-center justify-center font-bold text-base"
            >
              ×
            </button>
          </div>

          <div className="p-4 overflow-y-auto space-y-3 flex-1">
            {/* Auto-Captured Context Chip */}
            <div className="p-2.5 bg-[#DFF5F2]/70 border border-[#19B7B0]/20 rounded-xl text-[11.5px] text-[#167E79] leading-tight">
              <strong>Captured Context:</strong>
              <div className="text-[#526074] mt-0.5">{capturedContext}</div>
            </div>

            {/* Sub-Tabs: Submit vs My Submissions */}
            <div className="flex bg-[#f2f7f6] p-1 rounded-xl border border-[#102033]/10">
              <button
                onClick={() => setActiveTab('submit')}
                className={`flex-1 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
                  activeTab === 'submit' ? 'bg-white text-[#167E79] shadow-sm' : 'text-[#657287]'
                }`}
              >
                Submit Feedback
              </button>
              <button
                onClick={() => setActiveTab('records')}
                className={`flex-1 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
                  activeTab === 'records' ? 'bg-white text-[#167E79] shadow-sm' : 'text-[#657287]'
                }`}
              >
                My Feedback ({records.length})
              </button>
            </div>

            {activeTab === 'submit' ? (
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* 4 Feedback Categories */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'Bug', label: 'Bug / Defect', icon: 'ncr_manager' },
                    { key: 'Feature request', label: 'Feature Idea', icon: 'advisor' },
                    { key: 'Usability', label: 'Usability Friction', icon: 'iconography_registry' },
                    { key: 'Praise', label: 'Praise', icon: 'milestone' },
                  ].map((cat) => (
                    <button
                      type="button"
                      key={cat.key}
                      onClick={() => setCategory(cat.key as any)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 text-[12px] font-semibold transition-all ${
                        category === cat.key
                          ? 'border-[#19B7B0] bg-[#DFF5F2] text-[#167E79]'
                          : 'border-[#102033]/10 bg-white text-[#526074] hover:bg-gray-50'
                      }`}
                    >
                      <OrigamiIcon name={cat.icon} size={18} />
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>

                {/* Feedback Textarea */}
                <div>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    maxLength={2000}
                    rows={4}
                    placeholder="Describe the issue, idea, or compliance friction..."
                    className="w-full p-3 border border-[#102033]/15 rounded-xl text-[13px] text-[#102033] focus:outline-none focus:border-[#19B7B0] focus:ring-2 focus:ring-[#19B7B0]/15 resize-none bg-white"
                  />
                  <div className="flex justify-between items-center text-[10.5px] text-[var(--ax-text-muted)] mt-1">
                    <span>Min 10 characters</span>
                    <span>{text.length} / 2,000</span>
                  </div>
                </div>

                {/* Attachment simulation */}
                <div
                  onClick={() => showToast('Screenshot attachment simulation active.')}
                  className="p-2.5 border border-dashed border-[#102033]/20 rounded-xl text-center text-[11.5px] text-[#657287] hover:bg-[#DFF5F2]/40 hover:border-[#19B7B0] cursor-pointer transition-colors"
                >
                  + Attach screenshot or plan mark-up
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-[#19B7B0] to-[#167E79] text-white rounded-xl font-bold text-[13px] hover:opacity-95 shadow-md transition-opacity"
                >
                  Submit with Workspace Context
                </button>
              </form>
            ) : (
              /* Records View */
              <div className="space-y-2 max-h-[340px] overflow-y-auto">
                {records.map((rec) => (
                  <div key={rec.id} className="p-3 border border-[#102033]/10 rounded-xl space-y-1 bg-[#fcfdfd]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#102033]/5 text-[#657287]">
                        {rec.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          rec.status === 'Shipped'
                            ? 'bg-green-100 text-green-700'
                            : rec.status === 'Planned'
                            ? 'bg-blue-100 text-blue-700'
                            : rec.status === 'Reviewing'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </div>
                    <div className="text-[12.5px] font-bold text-[#102033]">{rec.title}</div>
                    <div className="text-[11px] text-[#657287] truncate">{rec.context}</div>
                    <div className="text-[10px] text-[var(--ax-text-muted)]">{rec.date}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed right-6 bottom-24 bg-[#102033] text-white text-[12.5px] px-4 py-2.5 rounded-xl shadow-2xl border border-white/10 z-50 animate-in fade-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}
    </>
  );
};
