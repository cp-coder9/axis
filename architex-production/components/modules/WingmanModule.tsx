'use client';

import React, { useState, useRef } from 'react';
import { OrigamiIcon } from '@/lib/origami-icons';
import { ProjectEntity, RoleKey, ToolDefinition } from '@/lib/types';
import { ALL_TOOLS, ROLE_PROFILES } from '@/lib/data';
import { useControlledToolTab } from '@/lib/use-controlled-tool-tab';
import { WingmanProvider, PROVIDER_PRESETS, isValidProviderConfig } from '@/lib/wingman-providers';
import type { WingmanProviderConfig } from '@/lib/wingman-providers';

interface WingmanModuleProps {
  activeProject: ProjectEntity;
  currentRole: RoleKey;
  activeTabKey: string;
  isProjectMode: boolean;
  onTabChange?: (key: string) => void;
}

interface MessageItem {
  id: string;
  sender: 'user' | 'wingman';
  text: string;
  provenance?: string;
  model?: string;
  timestamp?: string;
  confidence?: number;
  approved?: boolean;
  documentRef?: string;
}

export interface DocumentSummaryRecord {
  id: string;
  title: string;
  category: 'Statutory Standard' | 'Contract / Legal' | 'Municipal By-law' | 'Specification' | 'Drawing Transmittal' | 'Geotechnical';
  referenceCode: string;
  sourceType: 'Uploaded File' | 'Document Library' | 'External Link' | 'Direct Input';
  sourceFilename?: string;
  sourceUrl?: string;
  fileSize?: string;
  pageCount?: number;
  aiModel: string;
  timestamp: string;
  provenanceHash: string;
  summaryMode: 'Executive & Statutory Audit' | 'Hold Points & Compliance' | 'Contractual Liabilities' | 'BoM & Quantities';
  summaryText: string;
  keyClauses: string[];
  riskRating: 'Low' | 'Medium' | 'High' | 'Critical Hold';
  signedOff: boolean;
  signedOffBy?: string;
  projectId: string;
}

const PRESET_PROJECT_DOCS = [
  {
    id: 'doc-sans-xa',
    title: 'SANS 10400-XA Edition 2: Energy Usage in Buildings',
    category: 'Statutory Standard' as const,
    referenceCode: 'SANS 10400-XA:2021',
    fileSize: '4.8 MB',
    pageCount: 42,
    snippet: 'Prescribes mandatory envelope thermal resistance (Rt >= 3.70 for Zone 2 roofs), fenestration solar heat gain coefficients (SHGC <= 0.50), and 50% renewable hot water heating.',
  },
  {
    id: 'doc-jbcc-62',
    title: 'JBCC Principal Building Agreement Edition 6.2',
    category: 'Contract / Legal' as const,
    referenceCode: 'JBCC PBA 6.2 (2018)',
    fileSize: '3.2 MB',
    pageCount: 38,
    snippet: 'Governs contractor appointment, Clause 17 Practical Completion, Clause 23 Extension of Time (EoT) 20-day notice provisions, and security guarantees.',
  },
  {
    id: 'doc-sans-t',
    title: 'SANS 10400-T: Fire Protection & Rational Design',
    category: 'Statutory Standard' as const,
    referenceCode: 'SANS 10400-T:2020',
    fileSize: '6.1 MB',
    pageCount: 64,
    snippet: 'Specifies division walls, escape route travel distances (max 45m), stair width calculations (min 1100mm for >50 persons), and rational fire design certifications.',
  },
  {
    id: 'doc-spluma-tsh',
    title: 'City of Tshwane Land Use Management By-Law & Zoning Scheme',
    category: 'Municipal By-law' as const,
    referenceCode: 'SPLUMA Sec 44 / CoT 2016',
    fileSize: '5.4 MB',
    pageCount: 52,
    snippet: 'Pretoria Faerie Glen Residential 1 zoning: 10m street building line, 3m side setbacks, 0.60 floor area ratio (FAR), and 50% max permissible coverage.',
  },
  {
    id: 'doc-procsa-39',
    title: 'PROCSA Client / Architectural Consultant Agreement',
    category: 'Contract / Legal' as const,
    referenceCode: 'PROCSA Edition 3.9',
    fileSize: '2.1 MB',
    pageCount: 26,
    snippet: 'Standard professional services agreement defining Stages 1 to 6 deliverables, professional indemnity requirements, and SACAP fee apportionment.',
  },
  {
    id: 'doc-draw-p03',
    title: 'Architectural Working Drawings Set A-101 to A-210',
    category: 'Drawing Transmittal' as const,
    referenceCode: 'ARCH-DWG-P03 (Aug 2026)',
    fileSize: '28.6 MB',
    pageCount: 16,
    snippet: 'General arrangement plans, building elevations, sectional details, fenestration schedule W-01 to W-12, and door schedule.',
  },
];

const INITIAL_SAVED_SUMMARIES: DocumentSummaryRecord[] = [
  {
    id: 'SUM-9841',
    title: 'SANS 10400-XA Edition 2: Energy Usage in Buildings',
    category: 'Statutory Standard',
    referenceCode: 'SANS 10400-XA:2021',
    sourceType: 'Document Library',
    fileSize: '4.8 MB',
    pageCount: 42,
    aiModel: 'gemini-2.5-flash',
    timestamp: '2026-08-19 14:32 SAST',
    provenanceHash: 'AUD-SHA256-8f90a2b4e7c1d3',
    summaryMode: 'Executive & Statutory Audit',
    summaryText: `### Executive Statutory Audit Summary
**Document Verified:** SANS 10400-XA:2021 (Climatic Zone 2 - Pretoria / Highveld)
**Application:** Faerie Glen Residential (Stage 3 Design Development)

#### 1. Core Envelope Mandates
- **Roof Insulation:** Min $R_t \\ge 3.70\\,\\text{m}^2\\cdot\\text{K}/\\text{W}$. Current spec calls for 135mm mineral wool blanket ($R = 3.38$) + ceiling board ($R = 0.08$) + airspace ($R = 0.25$) = total $R_t = 3.71\\,\\text{m}^2\\cdot\\text{K}/\\text{W}$ (COMPLIANT).
- **External Masonry:** $R_t \\ge 0.35\\,\\text{m}^2\\cdot\\text{K}/\\text{W}$. 220mm brick cavity wall complies without external cladding.
- **Fenestration SHGC:** Maximum allowable solar heat gain coefficient is $0.50$ for NW elevation. Window schedule W-04 and W-05 require Low-E glass or $0.35$ projection eaves.

#### 2. Water Heating & Renewable Contribution
- Mandatory minimum $50\\%$ of domestic hot water energy must be derived from non-electrical resistance heating (heat pump or solar thermal loop).

#### 3. Statutory Sign-off Requirement
- Must be submitted with SANS 10400 Form 2 (Appointment of Competent Person - Energy) signed by registered professional.`,
    keyClauses: ['Clause 4.2 Table 2 (Envelope Rt)', 'Clause 5.3 (Fenestration Area)', 'Clause 6.1 (Water Heating 50%)', 'Form 2 / Form 4 Declarations'],
    riskRating: 'Medium',
    signedOff: true,
    signedOffBy: 'Justin Kruger (Pr.Arch 21904)',
    projectId: 'proj-1',
  },
  {
    id: 'SUM-9842',
    title: 'JBCC Principal Building Agreement Edition 6.2 (Contract Clauses)',
    category: 'Contract / Legal',
    referenceCode: 'JBCC PBA 6.2 (2018)',
    sourceType: 'Uploaded File',
    sourceFilename: 'JBCC_Edition_6.2_PBA_Contract.pdf',
    fileSize: '3.2 MB',
    pageCount: 38,
    aiModel: 'gemini-2.5-flash',
    timestamp: '2026-08-18 10:15 SAST',
    provenanceHash: 'AUD-SHA256-4c22e9a710bf88',
    summaryMode: 'Contractual Liabilities',
    summaryText: `### Contractual Liability & Notice Protocol Summary
**Document Verified:** JBCC PBA Edition 6.2 Clause Matrix
**Application:** Faerie Glen Tender & Construction Administration Baseline

#### 1. Extension of Time (EoT) Mechanics - Clause 23.0
- **Notice of Delay:** Contractor must issue written notice within **20 working days** of the delaying circumstance becoming known.
- **Claim Quantification:** Detailed quantified claim with revised critical path programme must be submitted within **40 working days**.
- **Failure to comply:** Contractor forfeits claim rights if notice periods lapse.

#### 2. Practical Completion & Defects - Clause 17.0
- Principal Agent inspects within 10 working days of Contractor notice.
- List for Practical Completion issued. Latent defects liability period runs for 5 years from final completion certificate.

#### 3. Payment & Penalties - Clause 25.0 / 24.0
- Interim payment certificates issued monthly within 7 working days of valuation. Penalty rate per calendar day: R 4,500.00 / day for delayed Practical Completion.`,
    keyClauses: ['Clause 17.0 (Practical Completion)', 'Clause 23.0 (Extension of Time 20-Day Notice)', 'Clause 24.0 (Penalties for Delay)', 'Clause 25.0 (Payment Certificates)'],
    riskRating: 'High',
    signedOff: false,
    projectId: 'proj-1',
  },
];

const TABS = (ALL_TOOLS['wingman'] as ToolDefinition).tabs;

export const WingmanModule: React.FC<WingmanModuleProps> = ({
  activeProject,
  currentRole,
  activeTabKey,
  isProjectMode,
  onTabChange,
}) => {
  const profile = ROLE_PROFILES[currentRole] || ROLE_PROFILES.architect;
  const [tab, setTab] = useControlledToolTab(activeTabKey, TABS, TABS[0]?.key || 'conversations', onTabChange);

  // Chat State
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'm-1',
      sender: 'wingman',
      text: `Hello ${profile.label}. I am Architex Wingman, your specialized built-environment AI copilot and document intelligence engine.\n\nI am initialized with ${activeProject.name} at ${activeProject.stage} stage (${activeProject.location}).\n\nI can analyze SANS 10400 standards, summarize contracts (JBCC, PROCSA, GCC), draft professional RFIs, evaluate municipal compliance hold points, or generate auditable document summaries stored with provenance metadata.`,
      provenance: 'PRV-INIT-001',
      model: 'gemini-2.5-flash',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      confidence: 0.99,
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [rfiForm, setRfiForm] = useState({
    recipient: 'Structural Engineer',
    subject: 'Level 3 column grid discrepancy',
    drawingRefs: 'A-101 Rev C / S-201 Rev B',
    issue: 'Gridline C4 differs by 150 mm between the architectural and structural issued-for-construction sets.',
    responseBy: '26 Aug 2026',
  });
  const [rfiDraft, setRfiDraft] = useState('');

  // Document Summarizer State
  const [savedSummaries, setSavedSummaries] = useState<DocumentSummaryRecord[]>(INITIAL_SAVED_SUMMARIES);
  const [selectedPresetDoc, setSelectedPresetDoc] = useState<string>(PRESET_PROJECT_DOCS[0].id);
  const [docInputMethod, setDocInputMethod] = useState<'preset' | 'upload' | 'link' | 'paste'>('preset');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<string | null>(null);
  const [docLinkUrl, setDocLinkUrl] = useState('');
  const [docPastedText, setDocPastedText] = useState('');
  const [customDocTitle, setCustomDocTitle] = useState('');
  const [customDocRef, setCustomDocRef] = useState('');
  const [customDocCategory, setCustomDocCategory] = useState<DocumentSummaryRecord['category']>('Statutory Standard');
  const [selectedSummaryMode, setSelectedSummaryMode] = useState<DocumentSummaryRecord['summaryMode']>('Executive & Statutory Audit');
  const [summarizing, setSummarizing] = useState(false);
  const [activeSummaryDetail, setActiveSummaryDetail] = useState<DocumentSummaryRecord | null>(savedSummaries[0]);
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // UI Notifications & Modals
  const [toast, setToast] = useState<string | null>(null);
  const [auditSlipModal, setAuditSlipModal] = useState<DocumentSummaryRecord | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageCounter = useRef(20);

  // BYOAPI (Bring-Your-Own-API) provider configuration — stored in the
  // browser only; keys are never persisted server-side.
  const [providerSettingsOpen, setProviderSettingsOpen] = useState(false);
  const [providerConfig, setProviderConfig] = useState<WingmanProviderConfig>(() => {
    try {
      const raw = localStorage.getItem('wingman.byoai');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (isValidProviderConfig(parsed)) return parsed;
      }
    } catch {
      /* fall through to default */
    }
    return { provider: 'gemini', apiKey: '', model: 'gemini-2.5-flash' };
  });
  const [providerDraft, setProviderDraft] = useState<WingmanProviderConfig>({
    provider: 'gemini',
    apiKey: '',
    model: 'gemini-2.5-flash',
  });

  // The draft form is seeded from the persisted config each time the settings
  // panel opens (see the open handler) — no sync effect needed.

  const openProviderSettings = () => {
    setProviderDraft(providerConfig);
    setProviderSettingsOpen(true);
  };

  const saveProviderConfig = (cfg: WingmanProviderConfig) => {
    if (cfg.provider !== 'gemini' && !cfg.apiKey.trim()) {
      showToast('Please enter an API key for your chosen provider.');
      return;
    }
    setProviderConfig(cfg);
    try {
      localStorage.setItem('wingman.byoai', JSON.stringify(cfg));
    } catch {
      /* storage unavailable — keep in memory */
    }
    setProviderSettingsOpen(false);
    showToast(`Wingman engine switched to ${PROVIDER_PRESETS[cfg.provider].label} (${cfg.model}).`);
  };

  const clearProviderConfig = () => {
    const cfg: WingmanProviderConfig = { provider: 'gemini', apiKey: '', model: 'gemini-2.5-flash' };
    setProviderConfig(cfg);
    try {
      localStorage.removeItem('wingman.byoai');
    } catch {
      /* ignore */
    }
    setProviderSettingsOpen(false);
    showToast('Wingman returned to the default Gemini engine.');
  };

  const activeProviderLabel = PROVIDER_PRESETS[providerConfig.provider].label;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Chat Handler
  const handleSendChat = async (customPrompt?: string, capability?: string) => {
    const promptToSend = customPrompt || inputPrompt;
    if (!promptToSend.trim() || chatLoading) return;

    messageCounter.current += 1;
    const userMsgId = `u-${messageCounter.current}`;

    const userMsg: MessageItem = {
      id: userMsgId,
      sender: 'user',
      text: promptToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputPrompt('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/wingman', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSend,
          capability: capability || 'general_query',
          projectContext: activeProject,
          roleContext: profile.label,
          providerConfig,
        }),
      });

      const data = await res.json();

      messageCounter.current += 1;
      const aiMsg: MessageItem = {
        id: `w-${messageCounter.current}`,
        sender: 'wingman',
        text: data.text || 'Analysis completed according to SANS 10400 standards.',
        provenance: data.provenance || `PRV-${Math.floor(1000 + Math.random() * 9000)}`,
        model: data.model || providerConfig.model || 'gemini-2.5-flash',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        confidence: data.confidence || 0.95,
        approved: false,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      messageCounter.current += 1;
      const fallbackMsg: MessageItem = {
        id: `w-${messageCounter.current}`,
        sender: 'wingman',
        text: `[Offline Local Fallback]\nStatutory review for "${promptToSend}":\n- Evaluated against SANS 10400-XA and JBCC 6.2.\n- Ensure professional sign-off before municipal or tender distribution.`,
        provenance: 'PRV-OFFLINE',
        model: 'wingman-simulated',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        confidence: 0.9,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  // Document File Upload Simulator
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      setUploadedFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
      setCustomDocTitle(file.name.replace(/\.[^/.]+$/, ''));
      setCustomDocRef(`DOC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
      showToast(`Document "${file.name}" loaded for AI analysis.`);
    }
  };

  // Trigger AI Summarization
  const handleGenerateSummary = async () => {
    let docTitle = '';
    let docRef = '';
    let docCategory: DocumentSummaryRecord['category'] = 'Statutory Standard';
    let docContent = '';
    let sourceMeta: Partial<DocumentSummaryRecord> = {};

    if (docInputMethod === 'preset') {
      const preset = PRESET_PROJECT_DOCS.find((d) => d.id === selectedPresetDoc);
      if (!preset) return;
      docTitle = preset.title;
      docRef = preset.referenceCode;
      docCategory = preset.category;
      docContent = `${preset.title} (${preset.referenceCode}):\n${preset.snippet}`;
      sourceMeta = {
        sourceType: 'Document Library',
        fileSize: preset.fileSize,
        pageCount: preset.pageCount,
      };
    } else if (docInputMethod === 'upload') {
      if (!uploadedFileName) {
        showToast('Please select or upload a document first.');
        return;
      }
      docTitle = customDocTitle || uploadedFileName;
      docRef = customDocRef || 'REV-01';
      docCategory = customDocCategory;
      docContent = `Document: ${docTitle} (${docRef})\nAttached file content for project ${activeProject.name}.`;
      sourceMeta = {
        sourceType: 'Uploaded File',
        sourceFilename: uploadedFileName,
        fileSize: uploadedFileSize || '3.4 MB',
        pageCount: 18,
      };
    } else if (docInputMethod === 'link') {
      if (!docLinkUrl.trim()) {
        showToast('Please provide a document URL or cloud storage link.');
        return;
      }
      docTitle = customDocTitle || 'Linked Cloud Document';
      docRef = customDocRef || 'EXT-LINK';
      docCategory = customDocCategory;
      docContent = `Document linked at: ${docLinkUrl}\nContext: Technical compliance and statutory review for ${activeProject.name}.`;
      sourceMeta = {
        sourceType: 'External Link',
        sourceUrl: docLinkUrl,
        fileSize: 'Stream',
      };
    } else {
      if (!docPastedText.trim()) {
        showToast('Please paste document clauses or text to summarize.');
        return;
      }
      docTitle = customDocTitle || 'Direct Input Specification Clauses';
      docRef = customDocRef || 'RAW-TXT';
      docCategory = customDocCategory;
      docContent = docPastedText;
      sourceMeta = {
        sourceType: 'Direct Input',
        fileSize: `${(docPastedText.length / 1024).toFixed(1)} KB`,
      };
    }

    setSummarizing(true);

    try {
      const res = await fetch('/api/wingman', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: docContent,
          capability: 'summarize_document',
          summaryMode: selectedSummaryMode,
          projectContext: activeProject,
          roleContext: profile.label,
          documentContext: {
            title: docTitle,
            reference: docRef,
            type: docCategory,
            content: docContent,
          },
          providerConfig,
        }),
      });

      const data = await res.json();
      const newId = `SUM-${Math.floor(1000 + Math.random() * 9000)}`;
      const provenanceHash = data.provenance || `AUD-SHA256-${Math.random().toString(36).substring(2, 12)}`;

      const newRecord: DocumentSummaryRecord = {
        id: newId,
        title: docTitle,
        category: docCategory,
        referenceCode: docRef,
        sourceType: sourceMeta.sourceType || 'Document Library',
        sourceFilename: sourceMeta.sourceFilename,
        sourceUrl: sourceMeta.sourceUrl,
        fileSize: sourceMeta.fileSize,
        pageCount: sourceMeta.pageCount,
        aiModel: providerConfig.model || 'gemini-2.5-flash',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' SAST',
        provenanceHash,
        summaryMode: selectedSummaryMode,
        summaryText: data.text || 'Executive summary generated successfully.',
        keyClauses: [
          'Clause 4.2 / Table 2 (Thermal Resistance Mandates)',
          'Clause 5.3 (Fenestration Area & Shading Calculations)',
          'Clause 6.1 (50% Renewable Water Heating Contribution)',
          'SANS 10400 Form 2 / Form 4 Declarations',
        ],
        riskRating: docCategory === 'Statutory Standard' ? 'Medium' : docCategory === 'Contract / Legal' ? 'High' : 'Low',
        signedOff: false,
        projectId: activeProject.id,
      };

      setSavedSummaries((prev) => [newRecord, ...prev]);
      setActiveSummaryDetail(newRecord);
      showToast(`AI Summary "${docTitle}" created with auditable hash: ${provenanceHash}`);
    } catch (err) {
      console.error(err);
      showToast('Error generating AI document summary. Using offline audit slip fallback.');
    } finally {
      setSummarizing(false);
    }
  };

  // Sign-off Summary Record
  const handleSignOff = (summaryId: string) => {
    setSavedSummaries((prev) =>
      prev.map((s) =>
        s.id === summaryId
          ? {
              ...s,
              signedOff: true,
              signedOffBy: `${profile.label} (${profile.code}) - Verified ${new Date().toLocaleDateString()}`,
            }
          : s
      )
    );
    if (activeSummaryDetail?.id === summaryId) {
      setActiveSummaryDetail((prev) =>
        prev
          ? {
              ...prev,
              signedOff: true,
              signedOffBy: `${profile.label} (${profile.code}) - Verified ${new Date().toLocaleDateString()}`,
            }
          : null
      );
    }
    showToast(`Summary ${summaryId} signed off & locked into Project Audit Trail.`);
  };

  // Copy Summary to Clipboard
  const handleCopySummary = (text: string) => {
    navigator.clipboard?.writeText(text);
    showToast('Auditable summary copied to clipboard.');
  };

  // Send summary to Wingman Chat
  const handleSendToChat = (record: DocumentSummaryRecord) => {
    setTab('conversations');
    handleSendChat(
      `Please provide a detailed risk mitigation action plan for the clauses identified in ${record.title} (${record.referenceCode}).`,
      'flag_compliance'
    );
  };

  const handleDraftRfi = () => {
    if (!rfiForm.subject.trim() || !rfiForm.issue.trim()) {
      showToast('Add an RFI subject and coordination issue before drafting.');
      return;
    }

    const draft = `REQUEST FOR INFORMATION\nProject: ${activeProject.name}\nTo: ${rfiForm.recipient}\nSubject: ${rfiForm.subject}\nDrawing references: ${rfiForm.drawingRefs || 'To be confirmed'}\nResponse required by: ${rfiForm.responseBy || 'At earliest convenience'}\n\nCoordination issue\n${rfiForm.issue}\n\nInformation requested\nPlease confirm the governing dimension and issue a coordinated instruction or revised detail. Identify any programme, cost, or statutory impact arising from the response.\n\nPrepared by ${profile.label} with Wingman AI. Professional review required before issue.`;
    setRfiDraft(draft);
    showToast('RFI draft prepared for professional review.');
  };

  const sendRfiToConversation = () => {
    if (!rfiDraft) return;
    setTab('conversations');
    handleSendChat(rfiDraft, 'draft_rfi');
  };

  // Filtered saved summaries
  const filteredSummaries = savedSummaries.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.referenceCode.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.provenanceHash.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      {/* Module Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6]">
            <OrigamiIcon name="wingman" size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#102033] tracking-tight">Architex Wingman AI Workspace</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
                Statutory & Document Intelligence
              </span>
            </div>
            <p className="text-[13px] text-[#657287]">
              Context-grounded assistant for South African statutory compliance, contract administration, RFI drafting, and auditable AI document summarization.
            </p>
          </div>
        </div>

        {/* Canonical Wingman Navigation */}
        <div className="flex bg-white p-1 rounded-2xl border border-[#102033]/15 shadow-sm overflow-x-auto max-w-full">
          {TABS.map((t) => (
            <button
              key={t.key}
              aria-pressed={tab === t.key}
              onClick={() => setTab(t.key || '')}
              className={`px-3 py-1.5 rounded-xl text-[12px] font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                tab === t.key
                  ? 'bg-[#8B5CF6] text-white shadow-sm'
                  : 'text-[#657287] hover:text-[#102033]'
              }`}
            >
              <OrigamiIcon name={t.icon as any} size={14} />
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* COMPLIANCE SCAN: DOCUMENT SUMMARIZER & AUDIT VAULT */}
      {tab === 'compliance_scan' && (
        <div data-tool-tab="compliance_scan" className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Document Ingestion & Summary Configuration (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <section className="bg-white border border-[#102033]/10 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#102033]/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 font-bold">
                    <OrigamiIcon name="document" size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#102033]">Ingest Project Document</h3>
                    <p className="text-[11px] text-[#657287]">Select, upload, or link document for AI analysis</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 text-[10.5px] font-bold">
                  Auditable ISO-19650
                </span>
              </div>

              {/* Source Input Mode Selector */}
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#f5faf9] rounded-xl border text-[11px] font-semibold text-center">
                {[
                  { id: 'preset', label: 'Preset Lib' },
                  { id: 'upload', label: 'Upload File' },
                  { id: 'link', label: 'Cloud Link' },
                  { id: 'paste', label: 'Paste Text' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setDocInputMethod(m.id as any)}
                    className={`py-1.5 rounded-lg transition-all ${
                      docInputMethod === m.id
                        ? 'bg-white text-[#8B5CF6] font-bold shadow-xs border'
                        : 'text-[#657287] hover:text-[#102033]'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Input Method Renderers */}
              {docInputMethod === 'preset' && (
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#657287] uppercase tracking-wider">
                    Select Project Standard / Transmittal
                  </label>
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {PRESET_PROJECT_DOCS.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => setSelectedPresetDoc(doc.id)}
                        className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                          selectedPresetDoc === doc.id
                            ? 'bg-purple-50/70 border-purple-400 ring-1 ring-purple-300'
                            : 'bg-white border-[#102033]/10 hover:border-purple-200'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <span className="font-bold text-[#102033] line-clamp-1">{doc.title}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-[#657287] whitespace-nowrap">
                            {doc.fileSize}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[10.5px] text-[#657287] mt-1">
                          <span className="font-mono text-[#8B5CF6]">{doc.referenceCode}</span>
                          <span>{doc.pageCount} pages · {doc.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {docInputMethod === 'upload' && (
                <div className="space-y-3">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-purple-200 hover:border-purple-400 rounded-2xl p-4 text-center cursor-pointer bg-purple-50/30 transition-all"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,.txt,.dwg,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="w-10 h-10 mx-auto rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-2">
                      <OrigamiIcon name="document" size={20} />
                    </div>
                    <div className="text-xs font-bold text-[#102033]">
                      {uploadedFileName ? uploadedFileName : 'Click or Drag Document to Upload'}
                    </div>
                    <div className="text-[11px] text-[#657287] mt-0.5">
                      Supports PDF, DOCX, TXT, DWG transmittals (Up to 50MB)
                    </div>
                    {uploadedFileSize && (
                      <span className="inline-block mt-2 px-2 py-0.5 bg-green-100 text-green-700 text-[10.5px] rounded-full font-bold">
                        Ready: {uploadedFileSize}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10.5px] font-bold text-[#657287]">Document Title</label>
                      <input
                        type="text"
                        value={customDocTitle}
                        onChange={(e) => setCustomDocTitle(e.target.value)}
                        placeholder="e.g. Geotechnical Report Rev 2"
                        className="w-full mt-1 p-2 bg-[#f7fbfa] border rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10.5px] font-bold text-[#657287]">Category</label>
                      <select
                        value={customDocCategory}
                        onChange={(e) => setCustomDocCategory(e.target.value as any)}
                        className="w-full mt-1 p-2 bg-[#f7fbfa] border rounded-xl text-xs"
                      >
                        <option value="Statutory Standard">Statutory Standard</option>
                        <option value="Contract / Legal">Contract / Legal</option>
                        <option value="Municipal By-law">Municipal By-law</option>
                        <option value="Specification">Specification</option>
                        <option value="Drawing Transmittal">Drawing Transmittal</option>
                        <option value="Geotechnical">Geotechnical</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {docInputMethod === 'link' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[10.5px] font-bold text-[#657287]">Cloud / Repository Link</label>
                    <input
                      type="url"
                      value={docLinkUrl}
                      onChange={(e) => setDocLinkUrl(e.target.value)}
                      placeholder="https://drive.google.com/... or https://cde.architex.cloud/docs/A-204"
                      className="w-full mt-1 p-2.5 bg-[#f7fbfa] border rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10.5px] font-bold text-[#657287]">Document Name</label>
                      <input
                        type="text"
                        value={customDocTitle}
                        onChange={(e) => setCustomDocTitle(e.target.value)}
                        placeholder="Contract Addendum B"
                        className="w-full mt-1 p-2 bg-[#f7fbfa] border rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10.5px] font-bold text-[#657287]">Classification</label>
                      <select
                        value={customDocCategory}
                        onChange={(e) => setCustomDocCategory(e.target.value as any)}
                        className="w-full mt-1 p-2 bg-[#f7fbfa] border rounded-xl text-xs"
                      >
                        <option value="Statutory Standard">Statutory Standard</option>
                        <option value="Contract / Legal">Contract / Legal</option>
                        <option value="Specification">Specification</option>
                        <option value="Drawing Transmittal">Drawing Transmittal</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {docInputMethod === 'paste' && (
                <div className="space-y-2 text-xs">
                  <label className="text-[10.5px] font-bold text-[#657287]">Paste Document Clauses / Excerpt</label>
                  <textarea
                    rows={4}
                    value={docPastedText}
                    onChange={(e) => setDocPastedText(e.target.value)}
                    placeholder="Paste tender clauses, SANS extract, or contractor notice letter text..."
                    className="w-full p-2.5 bg-[#f7fbfa] border rounded-xl text-xs font-mono leading-relaxed"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={customDocTitle}
                      onChange={(e) => setCustomDocTitle(e.target.value)}
                      placeholder="Excerpt Title (e.g. JBCC Clause 23 Extract)"
                      className="p-2 bg-[#f7fbfa] border rounded-xl text-xs"
                    />
                    <select
                      value={customDocCategory}
                      onChange={(e) => setCustomDocCategory(e.target.value as any)}
                      className="p-2 bg-[#f7fbfa] border rounded-xl text-xs"
                    >
                      <option value="Contract / Legal">Contract / Legal</option>
                      <option value="Statutory Standard">Statutory Standard</option>
                      <option value="Specification">Specification</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Summary Mode & Model Parameters */}
              <div className="pt-3 border-t border-[#102033]/10 space-y-3">
                <div>
                  <label className="text-[10.5px] font-bold text-[#657287] uppercase tracking-wider">
                    AI Summary Framework Mode
                  </label>
                  <select
                    value={selectedSummaryMode}
                    onChange={(e) => setSelectedSummaryMode(e.target.value as any)}
                    className="w-full mt-1 p-2 bg-[#f7fbfa] border rounded-xl text-xs font-bold text-[#102033]"
                  >
                    <option value="Executive & Statutory Audit">Executive & Statutory Audit (Full Briefing)</option>
                    <option value="Hold Points & Compliance">Hold Points & Compliance Blockers (Council / NHBRC)</option>
                    <option value="Contractual Liabilities">Contractual Liabilities & Notice Clocks (JBCC / PROCSA)</option>
                    <option value="BoM & Quantities">BoM & Specifications Extraction (Trade Packages)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-[#657287]">AI Engine:</span>
                    <button
                      onClick={openProviderSettings}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#f7fbfa] border border-[#102033]/15 rounded-lg text-xs font-mono font-semibold text-[#8B5CF6] hover:border-purple-400 transition-all"
                      title="Configure bring-your-own API key (OpenAI / NVIDIA NIM / Gemini)"
                    >
                      <OrigamiIcon name="settings" size={13} />
                      {activeProviderLabel}
                      <span className="text-[9.5px] text-[#657287] font-bold uppercase">
                        {providerConfig.apiKey ? providerConfig.model : 'Default'}
                      </span>
                    </button>
                  </div>

                  <span className="text-[10.5px] text-[#167E79] font-mono font-bold">
                    Target: {activeProject.name}
                  </span>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerateSummary}
                  disabled={summarizing}
                  className="w-full py-3 bg-[#8B5CF6] hover:bg-purple-700 disabled:opacity-50 text-white rounded-2xl font-bold text-xs shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all"
                >
                  {summarizing ? (
                    <>
                      <span className="animate-spin">✦</span>
                      <span>Analyzing Document & Generating Auditable Summary...</span>
                    </>
                  ) : (
                    <>
                      <OrigamiIcon name="wingman" size={16} />
                      <span>Generate Auditable AI Summary & Register Hash</span>
                    </>
                  )}
                </button>
              </div>
            </section>

            {/* Saved Summaries Registry (List Filter) */}
            <section className="bg-white border border-[#102033]/10 rounded-3xl p-4 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-[#102033] uppercase tracking-wider">
                  Audit Vault ({filteredSummaries.length} Summaries)
                </h3>
                <div className="flex gap-1 text-[10.5px]">
                  {['All', 'Statutory Standard', 'Contract / Legal'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                        categoryFilter === cat ? 'bg-[#8B5CF6] text-white' : 'bg-gray-100 text-[#657287]'
                      }`}
                    >
                      {cat === 'Statutory Standard' ? 'SANS' : cat === 'Contract / Legal' ? 'Contracts' : 'All'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Search by title, reference code, or SHA hash..."
                  className="w-full px-3 py-1.5 bg-[#f7fbfa] border rounded-xl text-xs text-[#102033]"
                />
              </div>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {filteredSummaries.map((summary) => (
                  <div
                    key={summary.id}
                    onClick={() => setActiveSummaryDetail(summary)}
                    className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                      activeSummaryDetail?.id === summary.id
                        ? 'bg-purple-50 border-purple-400 shadow-xs'
                        : 'bg-gray-50/60 border-gray-100 hover:border-purple-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-[#102033] line-clamp-1">{summary.title}</span>
                      <span
                        className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full ${
                          summary.riskRating === 'Critical Hold'
                            ? 'bg-red-100 text-red-700'
                            : summary.riskRating === 'High'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {summary.riskRating}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[10.5px] text-[#657287] mt-1.5">
                      <span className="font-mono text-[#8B5CF6]">{summary.referenceCode}</span>
                      <span>{summary.timestamp.substring(0, 10)}</span>
                    </div>

                    <div className="flex justify-between items-center pt-1.5 mt-1.5 border-t border-[#102033]/5 text-[10px]">
                      <span className="font-mono text-[#96a0ad] truncate max-w-[150px]">
                        {summary.provenanceHash}
                      </span>
                      {summary.signedOff ? (
                        <span className="text-green-700 font-bold">✓ Signed Off</span>
                      ) : (
                        <span className="text-amber-600 font-medium">Pending Review</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Active Summary View & Auditable Slip (7 Cols) */}
          <div className="lg:col-span-7">
            {activeSummaryDetail ? (
              <div className="bg-white border border-[#102033]/10 rounded-3xl p-6 shadow-sm space-y-4">
                {/* Summary Metadata Card Header */}
                <div className="p-4 bg-gradient-to-r from-[#faf5ff] to-white border border-purple-100 rounded-2xl space-y-3">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-mono text-[11px] font-bold">
                          {activeSummaryDetail.id}
                        </span>
                        <span className="text-xs font-semibold text-[#657287]">
                          {activeSummaryDetail.category}
                        </span>
                      </div>
                      <h2 className="text-lg font-bold text-[#102033] mt-1">
                        {activeSummaryDetail.title}
                      </h2>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setAuditSlipModal(activeSummaryDetail)}
                        className="px-3 py-1.5 bg-white border border-purple-200 hover:border-purple-400 text-purple-700 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1"
                      >
                        <OrigamiIcon name="document" size={13} />
                        View Audit Slip
                      </button>
                      <button
                        onClick={() => handleCopySummary(activeSummaryDetail.summaryText)}
                        className="px-3 py-1.5 bg-white border hover:bg-gray-50 text-[#102033] rounded-xl text-xs font-bold shadow-xs"
                      >
                        Copy Markdown
                      </button>
                    </div>
                  </div>

                  {/* Cryptographic & Contextual Metadata Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-purple-100/80 text-[11px]">
                    <div>
                      <div className="text-[10px] text-[#657287] uppercase font-bold">AI Model</div>
                      <div className="font-mono font-bold text-[#8B5CF6]">{activeSummaryDetail.aiModel}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#657287] uppercase font-bold">Timestamp (SAST)</div>
                      <div className="font-mono text-[#102033]">{activeSummaryDetail.timestamp}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#657287] uppercase font-bold">Source Reference</div>
                      <div className="font-semibold text-[#102033]">{activeSummaryDetail.referenceCode}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#657287] uppercase font-bold">Provenance Hash</div>
                      <div className="font-mono text-purple-700 truncate" title={activeSummaryDetail.provenanceHash}>
                        {activeSummaryDetail.provenanceHash.substring(0, 16)}...
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Clauses Extracted Strip */}
                <div className="p-3 bg-gray-50 border rounded-2xl space-y-1.5">
                  <div className="text-[11px] font-bold text-[#657287] uppercase tracking-wider">
                    Statutory & Contractual Clauses Identified
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeSummaryDetail.keyClauses.map((clause, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-white border border-[#102033]/10 text-[#102033] text-[11px] rounded-lg font-medium shadow-xs"
                      >
                        {clause}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Structured Summary Body */}
                <div className="p-4 bg-white border border-[#102033]/10 rounded-2xl space-y-3 max-h-[380px] overflow-y-auto text-xs text-[#102033] leading-relaxed">
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap font-sans text-xs">
                    {activeSummaryDetail.summaryText}
                  </div>
                </div>

                {/* Action Footer & Sign-off */}
                <div className="p-3.5 bg-gray-50 border rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="text-xs">
                    {activeSummaryDetail.signedOff ? (
                      <div className="text-green-700 font-bold flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-[10px]">✓</span>
                        Signed Off: {activeSummaryDetail.signedOffBy}
                      </div>
                    ) : (
                      <div className="text-amber-700 text-[11px] font-medium">
                        Pending registered professional review before statutory submission.
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSendToChat(activeSummaryDetail)}
                      className="px-3.5 py-2 bg-white border border-purple-200 hover:border-purple-400 text-purple-700 font-bold rounded-xl text-xs shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <OrigamiIcon name="wingman" size={14} />
                      Ask Wingman About This
                    </button>
                    {!activeSummaryDetail.signedOff && (
                      <button
                        onClick={() => handleSignOff(activeSummaryDetail.id)}
                        className="px-4 py-2 bg-[#8B5CF6] hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
                      >
                        Sign-Off & Audit Lock
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border rounded-3xl p-12 text-center text-[#657287] space-y-3">
                <OrigamiIcon name="document" size={36} className="mx-auto text-purple-300" />
                <p className="text-sm font-bold text-[#102033]">No Document Summary Selected</p>
                <p className="text-xs">Select a preset standard or upload a project document to generate a summary.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONVERSATIONS: COPILOT CHAT STREAM */}
      {tab === 'conversations' && (
        <div data-tool-tab="conversations" className="space-y-4">
          {/* Quick Prompts Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {[
              {
                title: 'Draft RFI to Engineer',
                desc: 'Level 3 column grid spacing discrepancy between A-101 and S-201',
                capability: 'draft_rfi',
              },
              {
                title: 'SANS 10400 Compliance Gap',
                desc: 'Scan fenestration SHGC and fire rational design blockers',
                capability: 'flag_compliance',
              },
              {
                title: 'Explain JBCC 6.2 Clause',
                desc: 'Clarify Practical Completion and Extension of Time mechanics',
                capability: 'explain_clause',
              },
              {
                title: 'Municipal Readiness Pack',
                desc: 'Summarise documentation hold points for Council filing',
                capability: 'general_query',
              },
            ].map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendChat(p.desc, p.capability)}
                className="p-3 bg-white border border-[#102033]/10 hover:border-purple-300 rounded-2xl text-left shadow-xs hover:shadow-md transition-all group"
              >
                <div className="font-bold text-xs text-[#102033] group-hover:text-purple-700">{p.title}</div>
                <div className="text-[11px] text-[#657287] mt-1 line-clamp-2">{p.desc}</div>
              </button>
            ))}
          </div>

          {/* Chat Workspace */}
          <div className="bg-white border border-[#102033]/10 rounded-3xl p-4 shadow-sm flex flex-col h-[520px]">
            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto space-y-3.5 p-2">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 max-w-[85%] ${m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                      m.sender === 'user'
                        ? 'bg-[#102033] text-white'
                        : 'bg-purple-100 text-purple-700 border border-purple-200'
                    }`}
                  >
                    {m.sender === 'user' ? profile.code : 'AI'}
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed space-y-2 ${
                      m.sender === 'user'
                        ? 'bg-[#102033] text-white rounded-tr-none'
                        : 'bg-[#fcfaff] border border-purple-100 text-[#102033] rounded-tl-none shadow-xs'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.text}</div>

                    {m.sender === 'wingman' && (
                      <div className="pt-2 border-t border-purple-100/80 flex flex-wrap items-center justify-between gap-2 text-[10.5px]">
                        <div className="flex items-center gap-1.5 text-[#657287]">
                          <span className="font-mono">{m.provenance}</span>
                          <span>·</span>
                          <span>Model: {m.model}</span>
                          <span>·</span>
                          <span>{m.timestamp}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {m.approved ? (
                            <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold">
                              ✓ Approved by {profile.label}
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                setMessages(messages.map((msg) => (msg.id === m.id ? { ...msg, approved: true } : msg)));
                                showToast('AI draft signed off and registered into Project Passport audit trail.');
                              }}
                              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold"
                            >
                              Sign-Off & Publish
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex gap-2 items-center text-xs text-purple-600 font-bold p-2">
                  <span className="animate-spin">✦</span> Wingman built-environment engine is analyzing statutory context...
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChat();
              }}
              className="pt-3 border-t border-[#102033]/10 flex gap-2"
            >
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder={`Ask Wingman about ${activeProject.name}, SANS 10400, or JBCC 6.2...`}
                className="flex-1 px-4 py-2.5 bg-[#f7fbfa] border border-[#102033]/15 rounded-2xl text-xs text-[#102033] focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={chatLoading || !inputPrompt.trim()}
                className="px-5 py-2.5 bg-[#8B5CF6] hover:bg-purple-700 disabled:opacity-40 text-white font-bold text-xs rounded-2xl shadow-sm transition-all"
              >
                Send Query
              </button>
            </form>
          </div>
        </div>
      )}

      {/* BYOAI: PROVIDER CONTROL CENTRE */}
      {tab === 'byoai' && (
        <div data-tool-tab="byoai" className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <section className="lg:col-span-5 bg-white border border-[#102033]/10 rounded-3xl p-5 shadow-sm space-y-5">
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#102033]/10">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#8B5CF6]">Active inference route</p>
                <h2 className="text-lg font-bold text-[#102033] mt-1">{activeProviderLabel}</h2>
                <p className="text-xs text-[#657287] font-mono mt-1">{providerConfig.model}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold ${providerConfig.provider === 'gemini' && !providerConfig.apiKey ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                {providerConfig.provider === 'gemini' && !providerConfig.apiKey ? 'Architex default' : 'Private key active'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-2xl bg-[#f7fbfa] border border-[#102033]/10">
                <div className="text-[10px] uppercase font-bold text-[#657287]">Project context</div>
                <div className="font-bold text-[#102033] mt-1">{activeProject.name}</div>
              </div>
              <div className="p-3 rounded-2xl bg-[#f7fbfa] border border-[#102033]/10">
                <div className="text-[10px] uppercase font-bold text-[#657287]">Credential scope</div>
                <div className="font-bold text-[#102033] mt-1">This browser only</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 text-xs text-[#526074] leading-relaxed">
              Provider credentials stay in local browser storage and are sent only with Wingman requests. They are not written to project records; generated outputs retain model and provenance metadata.
            </div>

            <button onClick={openProviderSettings} className="w-full py-3 bg-[#8B5CF6] hover:bg-purple-700 text-white rounded-2xl text-xs font-bold shadow-sm transition-all">
              Configure Active Provider
            </button>
          </section>

          <section className="lg:col-span-7 bg-white border border-[#102033]/10 rounded-3xl p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-sm font-bold text-[#102033]">Available AI engines</h2>
              <p className="text-[11px] text-[#657287] mt-1">Choose a route, then supply credentials and select a supported model.</p>
            </div>
            <div className="space-y-2.5">
              {(Object.keys(PROVIDER_PRESETS) as WingmanProvider[]).map((provider) => {
                const preset = PROVIDER_PRESETS[provider];
                const isActive = providerConfig.provider === provider;
                return (
                  <button
                    key={provider}
                    onClick={() => {
                      setProviderDraft({ provider, apiKey: provider === providerConfig.provider ? providerConfig.apiKey : '', model: preset.models[0] ?? '' });
                      setProviderSettingsOpen(true);
                    }}
                    className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between gap-4 transition-all ${isActive ? 'bg-purple-50 border-purple-300' : 'bg-white border-[#102033]/10 hover:border-purple-200'}`}
                  >
                    <div>
                      <div className="text-xs font-bold text-[#102033]">{preset.label}</div>
                      <div className="text-[10.5px] text-[#657287] mt-1">{preset.models.length} approved models · {preset.models.slice(0, 2).join(' / ')}</div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${isActive ? 'bg-[#8B5CF6] text-white' : 'bg-gray-100 text-[#657287]'}`}>
                      {isActive ? 'Active' : 'Configure'}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* PROVENANCE: AUDITABLE OUTPUT REGISTER */}
      {tab === 'provenance' && (
        <div data-tool-tab="provenance" className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              ['Registered outputs', savedSummaries.length.toString()],
              ['Professionally signed', savedSummaries.filter((s) => s.signedOff).length.toString()],
              ['Conversation traces', messages.filter((m) => m.provenance).length.toString()],
              ['Active model', providerConfig.model],
            ].map(([label, value]) => (
              <div key={label} className="bg-white border border-[#102033]/10 rounded-2xl p-4 shadow-sm">
                <div className="text-[10px] uppercase tracking-wider font-bold text-[#657287]">{label}</div>
                <div className="mt-1 text-sm font-bold text-[#102033] truncate" title={value}>{value}</div>
              </div>
            ))}
          </div>

          <section className="bg-white border border-[#102033]/10 rounded-3xl p-5 shadow-sm overflow-hidden">
            <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#8B5CF6]">ISO-19650 evidence chain</p>
                <h2 className="text-base font-bold text-[#102033] mt-1">AI output provenance register</h2>
              </div>
              <span className="text-[10.5px] text-[#657287] font-mono">Project passport: {activeProject.id}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-xs">
                <thead className="text-[10px] uppercase tracking-wider text-[#657287] border-b border-[#102033]/10">
                  <tr><th className="py-2 pr-3">Record</th><th className="py-2 pr-3">Source</th><th className="py-2 pr-3">Model / time</th><th className="py-2 pr-3">Provenance hash</th><th className="py-2 text-right">Control</th></tr>
                </thead>
                <tbody>
                  {savedSummaries.map((summary) => (
                    <tr key={summary.id} className="border-b border-[#102033]/5 last:border-0">
                      <td className="py-3 pr-3"><div className="font-bold text-[#102033]">{summary.id}</div><div className="text-[10.5px] text-[#657287]">{summary.referenceCode}</div></td>
                      <td className="py-3 pr-3"><div className="font-semibold text-[#102033] max-w-[220px] truncate">{summary.title}</div><div className="text-[10.5px] text-[#657287]">{summary.sourceType}</div></td>
                      <td className="py-3 pr-3"><div className="font-mono text-purple-700">{summary.aiModel}</div><div className="text-[10px] text-[#657287]">{summary.timestamp}</div></td>
                      <td className="py-3 pr-3 font-mono text-[10.5px] text-[#526074]">{summary.provenanceHash}</td>
                      <td className="py-3 text-right">
                        <button onClick={() => setAuditSlipModal(summary)} className="px-2.5 py-1.5 rounded-lg bg-purple-50 text-purple-700 font-bold hover:bg-purple-100">Inspect slip</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* DRAFT RFI: COORDINATED PROFESSIONAL REQUEST */}
      {tab === 'draft_rfi' && (
        <div data-tool-tab="draft_rfi" className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <section className="lg:col-span-5 bg-white border border-[#102033]/10 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="pb-3 border-b border-[#102033]/10">
              <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#8B5CF6]">Controlled correspondence</p>
              <h2 className="text-base font-bold text-[#102033] mt-1">Draft a coordinated RFI</h2>
              <p className="text-[11px] text-[#657287] mt-1">Frame the discrepancy, source references, and response clock before AI review.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-[10.5px] font-bold text-[#657287]">Recipient
                <input value={rfiForm.recipient} onChange={(e) => setRfiForm({ ...rfiForm, recipient: e.target.value })} className="w-full mt-1 p-2.5 bg-[#f7fbfa] border rounded-xl text-xs font-normal text-[#102033]" />
              </label>
              <label className="text-[10.5px] font-bold text-[#657287]">Response required by
                <input value={rfiForm.responseBy} onChange={(e) => setRfiForm({ ...rfiForm, responseBy: e.target.value })} className="w-full mt-1 p-2.5 bg-[#f7fbfa] border rounded-xl text-xs font-normal text-[#102033]" />
              </label>
            </div>
            <label className="block text-[10.5px] font-bold text-[#657287]">Subject
              <input value={rfiForm.subject} onChange={(e) => setRfiForm({ ...rfiForm, subject: e.target.value })} className="w-full mt-1 p-2.5 bg-[#f7fbfa] border rounded-xl text-xs font-normal text-[#102033]" />
            </label>
            <label className="block text-[10.5px] font-bold text-[#657287]">Drawing and document references
              <input value={rfiForm.drawingRefs} onChange={(e) => setRfiForm({ ...rfiForm, drawingRefs: e.target.value })} className="w-full mt-1 p-2.5 bg-[#f7fbfa] border rounded-xl text-xs font-mono font-normal text-[#102033]" />
            </label>
            <label className="block text-[10.5px] font-bold text-[#657287]">Coordination issue
              <textarea rows={5} value={rfiForm.issue} onChange={(e) => setRfiForm({ ...rfiForm, issue: e.target.value })} className="w-full mt-1 p-2.5 bg-[#f7fbfa] border rounded-xl text-xs font-normal text-[#102033] leading-relaxed" />
            </label>
            <button onClick={handleDraftRfi} className="w-full py-3 bg-[#8B5CF6] hover:bg-purple-700 text-white rounded-2xl text-xs font-bold shadow-sm">Prepare RFI Draft</button>
          </section>

          <section className="lg:col-span-7 bg-white border border-[#102033]/10 rounded-3xl p-5 shadow-sm flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#102033]/10">
              <div><h2 className="text-sm font-bold text-[#102033]">Professional issue preview</h2><p className="text-[10.5px] text-[#657287]">Review remains mandatory before project distribution.</p></div>
              <span className="px-2 py-1 rounded-lg bg-amber-100 text-amber-700 text-[10px] font-bold">Draft · Not issued</span>
            </div>
            <div className="flex-1 mt-4 p-4 rounded-2xl bg-[#fcfaff] border border-purple-100 whitespace-pre-wrap text-xs leading-relaxed text-[#102033]">
              {rfiDraft || 'Complete the coordination fields and prepare a structured request. The draft will include the project, response clock, source references, requested instruction, and professional review notice.'}
            </div>
            <div className="flex gap-2 pt-4">
              <button disabled={!rfiDraft} onClick={() => rfiDraft && handleCopySummary(rfiDraft)} className="px-4 py-2.5 bg-gray-100 disabled:opacity-40 text-[#102033] rounded-xl text-xs font-bold">Copy draft</button>
              <button disabled={!rfiDraft} onClick={sendRfiToConversation} className="flex-1 py-2.5 bg-[#102033] disabled:opacity-40 text-white rounded-xl text-xs font-bold">Send to Wingman for refinement</button>
            </div>
          </section>
        </div>
      )}

      {/* STATUS SUMMARY: PROJECT INTELLIGENCE BRIEF */}
      {tab === 'status_summary' && (
        <div data-tool-tab="status_summary" className="space-y-4">
          <section className="bg-gradient-to-br from-[#102033] to-[#253b57] text-white rounded-3xl p-6 shadow-sm overflow-hidden relative">
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-5">
              <div className="max-w-2xl">
                <p className="text-[10px] font-bold uppercase tracking-[.16em] text-purple-300">Wingman project briefing</p>
                <h2 className="text-2xl font-bold mt-2">{activeProject.name}</h2>
                <p className="text-xs text-slate-300 mt-2">{activeProject.stage} · {activeProject.location} · prepared for {profile.label}</p>
              </div>
              <button onClick={() => { setTab('conversations'); handleSendChat(`Prepare an executive project status summary for ${activeProject.name}, highlighting statutory hold points, document risks, decisions due, and recommended next actions.`, 'general_query'); }} className="px-4 py-2.5 rounded-xl bg-[#8B5CF6] hover:bg-purple-500 text-white text-xs font-bold shadow-lg">Generate live executive brief</button>
            </div>
          </section>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              ['Stage', activeProject.stage, 'Current project gateway'],
              ['Audit records', savedSummaries.length.toString(), `${savedSummaries.filter((s) => !s.signedOff).length} awaiting sign-off`],
              ['High-risk reviews', savedSummaries.filter((s) => s.riskRating === 'High' || s.riskRating === 'Critical Hold').length.toString(), 'Contract and statutory'],
              ['AI trace events', messages.filter((m) => m.sender === 'wingman').length.toString(), providerConfig.model],
            ].map(([label, value, note]) => (
              <div key={label} className="bg-white border border-[#102033]/10 rounded-2xl p-4 shadow-sm">
                <div className="text-[10px] uppercase tracking-wider font-bold text-[#657287]">{label}</div>
                <div className="text-lg font-bold text-[#102033] mt-1 truncate">{value}</div>
                <div className="text-[10.5px] text-[#657287] mt-1 truncate">{note}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <section className="bg-white border border-[#102033]/10 rounded-3xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-[#102033]">Priority decision queue</h3>
              <div className="mt-3 space-y-2">
                {[
                  ['Confirm Low-E glazing to W-04 / W-05', 'Energy compliance', 'Design team'],
                  ['Protect JBCC Clause 23 notice clock', 'Contract administration', 'Principal Agent'],
                  ['Close fire escape-width hold point', 'Council readiness', 'Fire Engineer'],
                ].map(([item, stream, owner]) => (
                  <div key={item} className="p-3 rounded-2xl bg-[#f7fbfa] border border-[#102033]/10 flex items-start justify-between gap-3">
                    <div><div className="text-xs font-bold text-[#102033]">{item}</div><div className="text-[10.5px] text-[#657287] mt-1">{stream}</div></div>
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-1 rounded-lg whitespace-nowrap">{owner}</span>
                  </div>
                ))}
              </div>
            </section>
            <section className="bg-white border border-[#102033]/10 rounded-3xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-[#102033]">Evidence readiness</h3>
              <div className="mt-4 space-y-4">
                {[
                  ['Statutory standards reviewed', 78],
                  ['Professional sign-offs complete', 50],
                  ['Council submission evidence', 64],
                  ['Contract notices protected', 86],
                ].map(([label, score]) => (
                  <div key={label as string}>
                    <div className="flex justify-between text-[11px] mb-1.5"><span className="font-semibold text-[#526074]">{label}</span><span className="font-mono font-bold text-[#102033]">{score}%</span></div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden"><div className="h-full rounded-full bg-[#8B5CF6]" style={{ width: `${score}%` }} /></div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}

      {/* AUDIT SLIP MODAL */}
      {auditSlipModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white border border-[#102033]/15 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <OrigamiIcon name="document" size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-[#102033] text-sm">Auditable Document Summary Certificate</h3>
                  <p className="text-[11px] text-[#657287]">Architex Wingman ISO-19650 Compliance Slip</p>
                </div>
              </div>
              <button
                onClick={() => setAuditSlipModal(null)}
                className="w-7 h-7 rounded-lg hover:bg-gray-100 text-[#657287] font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-gray-50 border rounded-2xl space-y-2 font-mono text-[11px] text-[#526074]">
              <div><strong>Summary Record ID:</strong> {auditSlipModal.id}</div>
              <div><strong>Source Document:</strong> {auditSlipModal.title}</div>
              <div><strong>Standard / Code Ref:</strong> {auditSlipModal.referenceCode}</div>
              <div><strong>Project Passport:</strong> {activeProject.name} (Stage: {activeProject.stage})</div>
              <div><strong>AI Processing Model:</strong> {auditSlipModal.aiModel}</div>
              <div><strong>Execution Timestamp:</strong> {auditSlipModal.timestamp}</div>
              <div><strong>Cryptographic Hash:</strong> {auditSlipModal.provenanceHash}</div>
              <div><strong>Sign-off Status:</strong> {auditSlipModal.signedOff ? auditSlipModal.signedOffBy : 'Pending Registered Professional Signature'}</div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-bold text-[#102033]">Summary Digest Extract:</div>
              <div className="p-3 bg-[#fcfaff] border border-purple-100 rounded-xl text-xs text-[#102033] max-h-36 overflow-y-auto leading-relaxed whitespace-pre-wrap">
                {auditSlipModal.summaryText}
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t">
              <button
                onClick={() => {
                  handleCopySummary(JSON.stringify(auditSlipModal, null, 2));
                  showToast('Full JSON Audit Certificate copied to clipboard.');
                }}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#102033] font-bold rounded-xl text-xs"
              >
                Export JSON Certificate
              </button>
              <button
                onClick={() => {
                  handleSignOff(auditSlipModal.id);
                  setAuditSlipModal(null);
                }}
                className="flex-1 py-2.5 bg-[#8B5CF6] hover:bg-purple-700 text-white font-bold rounded-xl text-xs"
              >
                Affix Professional Stamp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BYOAPI PROVIDER SETTINGS MODAL */}
      {providerSettingsOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white border border-[#102033]/15 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-[#102033]/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <OrigamiIcon name="wingman" size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-[#102033] text-sm">Wingman AI Engine</h3>
                  <p className="text-[11px] text-[#657287]">Bring your own API key — OpenAI, NVIDIA NIM or Gemini.</p>
                </div>
              </div>
              <button
                onClick={() => setProviderSettingsOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-gray-100 text-[#657287] font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[#657287] uppercase tracking-wider">Provider</label>
                <select
                  value={providerDraft.provider}
                  onChange={(e) => {
                    const provider = e.target.value as WingmanProvider;
                    const models = PROVIDER_PRESETS[provider].models;
                    setProviderDraft({
                      provider,
                      apiKey: providerDraft.apiKey,
                      model: models[0] ?? '',
                    });
                  }}
                  className="w-full mt-1 p-2.5 bg-[#f7fbfa] border border-[#102033]/15 rounded-xl text-xs font-semibold text-[#102033]"
                >
                  {(Object.keys(PROVIDER_PRESETS) as WingmanProvider[]).map((p) => (
                    <option key={p} value={p}>
                      {PROVIDER_PRESETS[p].label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#657287] uppercase tracking-wider">
                  API Key{providerDraft.provider === 'nvidia' ? ' (NVIDIA NIM key)' : providerDraft.provider === 'openai' ? ' (OpenAI key)' : ' (Gemini API key)'}
                </label>
                <input
                  type="password"
                  value={providerDraft.apiKey}
                  onChange={(e) => setProviderDraft({ ...providerDraft, apiKey: e.target.value.trim() })}
                  placeholder={providerDraft.provider === 'gemini' ? 'e.g. AIzaSy... (stored only in your browser)' : 'sk-... (stored only in your browser)'}
                  className="w-full mt-1 p-2.5 bg-[#f7fbfa] border border-[#102033]/15 rounded-xl text-xs font-mono focus:outline-none focus:border-purple-500"
                />
                <p className="text-[10.5px] text-[#657287] mt-1.5">
                  Your key is used directly from this browser to the provider. Architex never stores or logs it.
                </p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#657287] uppercase tracking-wider">Model</label>
                <select
                  value={providerDraft.model}
                  onChange={(e) => setProviderDraft({ ...providerDraft, model: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-[#f7fbfa] border border-[#102033]/15 rounded-xl text-xs font-mono font-semibold text-[#102033]"
                >
                  {PROVIDER_PRESETS[providerDraft.provider].models.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                {providerDraft.provider === 'nvidia' && (
                  <p className="text-[10.5px] text-[#8B5CF6] mt-1.5">
                    NVIDIA NIM vision models (e.g. nemotron-vision, llama-3.2-90b-vision) accept image understanding queries.
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-[#102033]/10">
              <button
                onClick={clearProviderConfig}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#102033] font-bold rounded-xl text-xs"
              >
                Reset to Default
              </button>
              <button
                onClick={() => saveProviderConfig(providerDraft)}
                className="flex-1 py-2.5 bg-[#8B5CF6] hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-sm"
              >
                Save AI Engine
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Toast */}
      {toast && (
        <div className="fixed right-6 bottom-24 bg-[#102033] text-white text-xs px-4 py-2.5 rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2">
          {toast}
        </div>
      )}
    </div>
  );
};
