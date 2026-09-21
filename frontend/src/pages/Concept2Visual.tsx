import React, { useState } from 'react';
import { WORKSPACE_SERVICES, SAMPLE_WORKFLOW, CORE_PILLARS } from '../data/mockWorkspaceData';
import { 
  Play, 
  CheckCircle2, 
  Mail, 
  Calendar as CalendarIcon, 
  HardDrive, 
  ChevronRight
} from 'lucide-react';

export const Concept2Visual: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'flow' | 'history' | 'audit'>('flow');
  const [simulatedExecution, setSimulatedExecution] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const runSimulation = () => {
    setSimulatedExecution(true);
    setCurrentStepIndex(0);
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= SAMPLE_WORKFLOW.steps.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 700);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-blue-600 selection:text-white pb-24">
      {/* 1. Minimal Navigation */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="#top" className="flex items-center gap-2.5 font-bold tracking-tight text-zinc-900">
              <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                <span className="bg-[#ea4335] rounded-xs"></span>
                <span className="bg-[#1a73e8] rounded-xs"></span>
                <span className="bg-[#0f9d58] rounded-xs"></span>
                <span className="bg-[#f9ab00] rounded-xs"></span>
              </div>
              <span className="text-base tracking-tight font-semibold">GWCC</span>
            </a>

            <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-600">
              <a href="#product-canvas" className="hover:text-zinc-950 font-medium transition-colors">Product Canvas</a>
              <a href="#integrations" className="hover:text-zinc-950 font-medium transition-colors">Supported Services</a>
              <a href="#methodology" className="hover:text-zinc-950 font-medium transition-colors">How it Works</a>
              <a href="#architecture" className="hover:text-zinc-950 font-medium transition-colors">Why GWCC</a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-500 font-mono bg-zinc-100 px-2.5 py-1 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>All 4 Services Connected</span>
            </div>
            <a
              href="#get-started"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-xs font-semibold tracking-wide transition-colors"
            >
              Connect Workspace
            </a>
          </div>
        </div>
      </header>

      {/* 2. Hero Section (Minimal copy, strong product lead) */}
      <section id="top" className="pt-16 pb-12 sm:pt-24 sm:pb-16 text-center">
        <div className="max-w-5xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-200/70 text-zinc-700 text-xs font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>Interactive Workflow Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-950 leading-[1.1] mb-6">
            One interface for your entire Google Workspace.
          </h1>

          <p className="text-lg sm:text-xl text-zinc-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Automate actions across Gmail, Drive, Calendar, and Sheets with instant visual feedback and audit guarantees.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={runSimulation}
              className="bg-zinc-900 hover:bg-zinc-800 text-white px-6 py-3 rounded-md text-sm font-medium flex items-center gap-2 shadow-sm transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Simulate Invoice Pipeline</span>
            </button>
            <a
              href="#product-canvas"
              className="bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-800 px-6 py-3 rounded-md text-sm font-medium transition-colors"
            >
              Inspect Workbench
            </a>
          </div>
        </div>
      </section>

      {/* 3. Product Visual (High-Fidelity Interactive Browser / Workbench) */}
      <section id="product-canvas" className="max-w-7xl mx-auto px-4 sm:px-8 mb-24">
        <div className="bg-white border border-zinc-300 rounded-lg shadow-xl overflow-hidden">
          {/* Browser Window Chrome */}
          <div className="bg-zinc-100 border-b border-zinc-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-zinc-300 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-zinc-300 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-zinc-300 inline-block"></span>
              <div className="ml-4 flex items-center gap-2 bg-white border border-zinc-200 rounded px-3 py-1 text-xs text-zinc-600 font-mono">
                <span className="text-zinc-400">https://</span>
                <span className="text-zinc-800 font-medium">app.gwcc.internal/builder/wf-0914</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setActiveTab('flow')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  activeTab === 'flow' ? 'bg-white shadow-xs text-zinc-900' : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                Canvas Flow
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  activeTab === 'history' ? 'bg-white shadow-xs text-zinc-900' : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                Execution Log
              </button>
              <button
                onClick={() => setActiveTab('audit')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  activeTab === 'audit' ? 'bg-white shadow-xs text-zinc-900' : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                Security Audit
              </button>
            </div>
          </div>

          {/* Workbench Canvas */}
          <div className="p-6 sm:p-8 bg-zinc-50/50 min-h-[520px]">
            {activeTab === 'flow' && (
              <div>
                {/* Workflow Header Bar */}
                <div className="bg-white border border-zinc-200 rounded-md p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-zinc-950 text-sm">Automated Invoice Archival & Approval Follow-up</h2>
                      <span className="text-[11px] font-mono px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                        Active Trigger
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">Listens for inbound vendor billing emails, saves attachments into Drive, schedules Calendar review.</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={runSimulation}
                      className="px-3 py-1.5 bg-zinc-900 text-white rounded text-xs font-medium hover:bg-zinc-800 flex items-center gap-1.5 transition-colors"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>{simulatedExecution ? 'Restart Test Run' : 'Execute Test Run'}</span>
                    </button>
                  </div>
                </div>

                {/* Workflow Nodes Grid with Connecting Rules */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                  {SAMPLE_WORKFLOW.steps.map((step, idx) => {
                    const isPassed = simulatedExecution && currentStepIndex >= idx;
                    const isCurrent = simulatedExecution && currentStepIndex === idx;

                    return (
                      <div
                        key={step.stepNumber}
                        className={`bg-white border rounded-md p-4 transition-all duration-200 relative ${
                          isCurrent
                            ? 'border-blue-600 ring-2 ring-blue-100 shadow-md'
                            : isPassed
                            ? 'border-emerald-500 shadow-sm'
                            : 'border-zinc-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[11px] font-mono text-zinc-400 font-semibold">
                            STEP 0{step.stepNumber}
                          </span>
                          <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded uppercase ${
                              step.service === 'gmail'
                                ? 'bg-red-50 text-red-700'
                                : step.service === 'drive'
                                ? 'bg-emerald-50 text-emerald-700'
                                : step.service === 'calendar'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {step.service}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mb-1.5">
                          {isPassed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-zinc-300 shrink-0"></div>
                          )}
                          <h3 className="text-xs font-bold text-zinc-900 truncate">{step.title}</h3>
                        </div>

                        <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed mb-3">
                          {step.summary}
                        </p>

                        <div className="pt-2 border-t border-zinc-100 font-mono text-[10px] text-zinc-500 flex justify-between">
                          <span className="truncate max-w-[130px]">{step.payloadKey}</span>
                          <span>{step.latencyMs}ms</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Real-time Telemetry & Parameter Inspector */}
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="bg-white border border-zinc-200 rounded-md p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900 mb-2">
                      <Mail className="w-3.5 h-3.5 text-red-600" />
                      <span>Trigger Ingestion Hook</span>
                    </div>
                    <div className="font-mono text-[11px] text-zinc-600 bg-zinc-50 p-2.5 rounded border border-zinc-200 space-y-1">
                      <div>Sender: billing@meridian-supplies.com</div>
                      <div>Subject: &quot;Invoice INV-2026-089&quot;</div>
                      <div>Attachment: INV-2026-089.pdf (1.2MB)</div>
                    </div>
                  </div>

                  <div className="bg-white border border-zinc-200 rounded-md p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900 mb-2">
                      <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Target Drive Vault</span>
                    </div>
                    <div className="font-mono text-[11px] text-zinc-600 bg-zinc-50 p-2.5 rounded border border-zinc-200 space-y-1">
                      <div>Folder: /Finance/2026/Q3/Payables</div>
                      <div>Permissions: Inherit folder role</div>
                      <div>Verification: SHA-256 Checksum Passed</div>
                    </div>
                  </div>

                  <div className="bg-white border border-zinc-200 rounded-md p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900 mb-2">
                      <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
                      <span>Follow-up Deadline</span>
                    </div>
                    <div className="font-mono text-[11px] text-zinc-600 bg-zinc-50 p-2.5 rounded border border-zinc-200 space-y-1">
                      <div>Event: &quot;Review Meridian Invoice #089&quot;</div>
                      <div>Date: In 3 Business Days</div>
                      <div>Attendees: finance-approvers@company.com</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="bg-white border border-zinc-200 rounded-md p-4 font-mono text-xs text-zinc-700 space-y-3">
                <div className="font-bold text-zinc-950 border-b pb-2 flex justify-between">
                  <span>EXECUTION LOGS (LAST 10 RUNS)</span>
                  <span className="text-emerald-600 font-semibold">100% SUCCESSFUL RUNS</span>
                </div>
                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between py-1 border-b border-zinc-100">
                    <span>2026-09-16 10:14:02 UTC</span>
                    <span className="text-zinc-900">wf_inv_2026_09 (Acme Corp)</span>
                    <span className="text-emerald-600">SUCCESS [925ms]</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-100">
                    <span>2026-09-16 09:30:18 UTC</span>
                    <span className="text-zinc-900">wf_inv_2026_09 (CloudScale Inc)</span>
                    <span className="text-emerald-600">SUCCESS [840ms]</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-100">
                    <span>2026-09-16 08:12:44 UTC</span>
                    <span className="text-zinc-900">wf_inv_2026_09 (Apex Logistics)</span>
                    <span className="text-emerald-600">SUCCESS [910ms]</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'audit' && (
              <div className="bg-white border border-zinc-200 rounded-md p-4 font-mono text-xs text-zinc-700 space-y-2">
                <div className="font-bold text-zinc-950 border-b pb-2 flex justify-between">
                  <span>SECURITY & PERMISSION AUDIT TRAIL</span>
                  <span className="text-blue-600">SCOPES: STRICT LEAST-PRIVILEGE</span>
                </div>
                <p className="text-[11px] text-zinc-500 font-sans leading-relaxed">
                  Every automated event is signed with Google Workspace OAuth credentials. GWCC maintains an immutable local audit trail recording file access and calendar mutations.
                </p>
                <div className="bg-zinc-50 p-3 border rounded text-[11px] space-y-1">
                  <div>• Authorized Service Account: gwcc-core@workspace-internal.iam.gserviceaccount.com</div>
                  <div>• Permitted Scopes: gmail.readonly, drive.file, calendar.events, spreadsheets</div>
                  <div>• External Data Persistence: NONE (Direct API proxy execution)</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. Integrations Directory */}
      <section id="integrations" className="max-w-7xl mx-auto px-6 sm:px-8 py-16 border-t border-zinc-200">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase font-mono tracking-widest text-zinc-500 block mb-2">Native Connectors</span>
          <h2 className="text-3xl font-bold text-zinc-950">Deep integration across the core four.</h2>
          <p className="text-zinc-600 text-sm mt-3">
            Direct authenticated access to your organization&apos;s existing Google Workspace infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {WORKSPACE_SERVICES.map((srv) => (
            <div key={srv.id} className="bg-white border border-zinc-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: `${srv.color}15`, color: srv.color }}>
                  {srv.name}
                </span>
                <span className="text-[10px] font-mono text-emerald-600 font-medium">Ready</span>
              </div>
              <h3 className="text-base font-bold text-zinc-950 mb-2">{srv.category}</h3>
              <p className="text-xs text-zinc-600 leading-relaxed mb-4">{srv.description}</p>
              
              <div className="border-t border-zinc-100 pt-3">
                <span className="text-[10px] font-mono uppercase text-zinc-400 block mb-1.5">Capabilities</span>
                <div className="flex flex-wrap gap-1.5">
                  {srv.actionsSupported.slice(0, 2).map((act, i) => (
                    <span key={i} className="text-[10px] bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded">
                      {act}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Connect → See → Automate Section */}
      <section id="methodology" className="bg-white border-y border-zinc-200 py-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="max-w-3xl mb-16">
            <span className="text-xs uppercase font-mono tracking-widest text-blue-600 font-semibold block mb-2">Core Philosophy</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950">
              Connect. See. Automate.
            </h2>
            <p className="text-zinc-600 text-base mt-2">
              Three progressive layers that transform isolated SaaS tools into a cohesive operational fabric.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {CORE_PILLARS.map((pillar) => (
              <div key={pillar.step} className="border border-zinc-200 rounded-lg p-6 bg-zinc-50/50">
                <span className="text-3xl font-extrabold text-zinc-300 font-mono block mb-3">{pillar.step}</span>
                <h3 className="text-xl font-bold text-zinc-950 mb-2">{pillar.name}</h3>
                <p className="text-xs text-zinc-700 font-medium leading-relaxed mb-6">{pillar.tagline}</p>
                <div className="space-y-2 border-t border-zinc-200 pt-4">
                  {pillar.details.map((detail, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-zinc-600">
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Cross-Service Automation Details */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 py-20">
        <div className="bg-zinc-900 text-white rounded-xl p-8 sm:p-12">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 block mb-2">Production Blueprint</span>
            <h2 className="text-3xl font-bold mb-4">Complete cross-service orchestration in action.</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              When an invoice arrives, GWCC coordinates Gmail extraction, Drive folder commitment, Calendar scheduling, and Sheets audit logging simultaneously without dropped payloads.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-zinc-800/80 border border-zinc-700 rounded-md p-4">
              <div className="text-red-400 font-mono text-xs mb-2">01. INGESTION</div>
              <div className="font-semibold text-sm mb-1">Gmail Watch</div>
              <p className="text-xs text-zinc-400">Captures invoice PDF and parses recipient details.</p>
            </div>
            <div className="bg-zinc-800/80 border border-zinc-700 rounded-md p-4">
              <div className="text-emerald-400 font-mono text-xs mb-2">02. ARCHIVAL</div>
              <div className="font-semibold text-sm mb-1">Drive Storage</div>
              <p className="text-xs text-zinc-400">Stores PDF under quarterly finance hierarchy with checksum.</p>
            </div>
            <div className="bg-zinc-800/80 border border-zinc-700 rounded-md p-4">
              <div className="text-blue-400 font-mono text-xs mb-2">03. SCHEDULE</div>
              <div className="font-semibold text-sm mb-1">Calendar Review</div>
              <p className="text-xs text-zinc-400">Creates 3-day approval deadline for finance officer.</p>
            </div>
            <div className="bg-zinc-800/80 border border-zinc-700 rounded-md p-4">
              <div className="text-amber-400 font-mono text-xs mb-2">04. RECORD</div>
              <div className="font-semibold text-sm mb-1">Sheets Append</div>
              <p className="text-xs text-zinc-400">Updates reconciliation ledger row with status & link.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Short Explanation of Why GWCC Exists */}
      <section id="architecture" className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-950 mb-4">
          Why we engineered GWCC
        </h2>
        <p className="text-zinc-600 text-base leading-relaxed mb-4">
          Modern teams spend hours manually copy-pasting links and data between Google Drive folders, Gmail threads, and scheduling calendars. Existing integration platforms require handing over administrative access to multi-tenant third-party vendors.
        </p>
        <p className="text-zinc-600 text-base leading-relaxed font-medium">
          GWCC delivers an internal, verifiable command layer where your workflows execute directly against Google Workspace APIs with zero intermediate data retention.
        </p>
      </section>

      {/* 8. Final CTA */}
      <section id="get-started" className="bg-white border-t border-zinc-200 py-16 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-zinc-950 mb-4">
            Connect your command center today.
          </h2>
          <p className="text-zinc-600 text-sm max-w-md mx-auto mb-8">
            Deploy GWCC to coordinate Gmail, Drive, Calendar, and Sheets across your organization.
          </p>
          <div className="flex justify-center gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-md text-sm transition-colors shadow-sm">
              Connect Google Workspace
            </button>
            <button className="border border-zinc-300 hover:bg-zinc-50 text-zinc-800 font-medium px-6 py-3 rounded-md text-sm transition-colors">
              Schedule Technical Overview
            </button>
          </div>
        </div>
      </section>

      {/* 9. Minimal Footer */}
      <footer className="py-8 text-center text-xs text-zinc-500 font-mono">
        GWCC • Google Workspace Command Center • Internal Engineering Release
      </footer>
    </div>
  );
};
