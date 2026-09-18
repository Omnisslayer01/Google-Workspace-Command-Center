import React, { useState } from 'react';
import { WORKSPACE_SERVICES, SAMPLE_WORKFLOW, CORE_PILLARS } from '../data/mockWorkspaceData';
import { ArrowRight, Check, Terminal, Shield, Play } from 'lucide-react';

export const Concept4Colorful: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const triggerSimulation = () => {
    setIsSimulating(true);
    let step = 1;
    setActiveStep(1);
    const interval = setInterval(() => {
      step += 1;
      if (step > 4) {
        clearInterval(interval);
        setIsSimulating(false);
      } else {
        setActiveStep(step);
      }
    }, 700);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-600 selection:text-white pb-24">
      {/* 1. Minimal Navigation with soft gradient border */}
      <header className="border-b border-indigo-100/80 sticky top-0 bg-white/95 backdrop-blur-xs z-40 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="#top" className="flex items-center gap-2.5 font-bold tracking-tight text-slate-950">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-pink-500 p-0.5 flex items-center justify-center shadow-xs">
                <span className="w-full h-full bg-white rounded-[6px] flex items-center justify-center font-bold text-xs bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  G
                </span>
              </div>
              <span className="text-base font-semibold tracking-tight text-slate-900">GWCC</span>
              <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-700 border border-indigo-100 rounded-full font-medium">
                v1.0
              </span>
            </a>

            <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600 font-medium">
              <a href="#platform" className="hover:text-indigo-600 transition-colors">Platform</a>
              <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How it works</a>
              <a href="#integrations" className="hover:text-indigo-600 transition-colors">Integrations</a>
              <a href="#case-study" className="hover:text-indigo-600 transition-colors">Case Study</a>
            </nav>
          </div>

          <div className="flex items-center gap-3 text-sm font-medium">
            <button className="text-slate-600 hover:text-indigo-600 px-3 py-1.5 transition-colors">
              Sign in
            </button>
            <a
              href="#get-started"
              className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white px-4 py-2 rounded-lg hover:shadow-md hover:shadow-indigo-200 transition-all text-xs uppercase tracking-wider font-semibold"
            >
              Get started
            </a>
          </div>
        </div>
      </header>

      {/* 2. Hero Section with soft ambient gradient (light cyan → lavender → soft pink) */}
      <section id="top" className="relative border-b border-indigo-50/80 pt-20 pb-20 sm:pt-28 sm:pb-28 bg-gradient-to-br from-[#F0F9FF] via-[#F5F3FF] to-[#FDF2F8]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2 font-mono text-xs text-indigo-700 bg-white/80 border border-indigo-200/60 px-3 py-1 rounded-full uppercase tracking-wider mb-6 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 inline-block animate-pulse"></span>
                <span className="font-semibold">Google Workspace Orchestration System</span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-950 leading-[1.06] mb-8">
                Your entire workspace.
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  One command center.
                </span>
              </h1>

              <p className="text-xl sm:text-2xl text-slate-700 leading-relaxed font-normal max-w-2xl">
                Bring Gmail, Calendar, Drive and Sheets into one place — and turn repetitive work into connected workflows.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <a
                  href="#get-started"
                  className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white px-7 py-3.5 rounded-lg hover:shadow-lg hover:shadow-indigo-200/70 transition-all text-sm font-semibold tracking-wide flex items-center gap-2"
                >
                  <span>Deploy Command Center</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#how-it-works"
                  className="bg-white/90 border border-slate-300 text-slate-800 px-6 py-3.5 rounded-lg hover:bg-white hover:border-indigo-300 transition-all text-sm font-medium shadow-xs"
                >
                  Explore Architectural Flow
                </a>
              </div>
            </div>

            {/* Asymmetric Metadata Column with soft lavender & peach highlights */}
            <div className="lg:col-span-4 bg-white/90 border border-indigo-100 rounded-xl p-6 sm:p-7 shadow-xs space-y-6 text-sm backdrop-blur-xs">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-indigo-500 font-semibold block mb-1">
                  Architecture
                </span>
                <p className="font-semibold text-slate-900">Direct OAuth Service Bus & Celery Queue</p>
              </div>
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-indigo-500 font-semibold block mb-1.5">
                  Supported Services
                </span>
                <div className="flex gap-2 items-center">
                  <span className="w-3 h-3 rounded-full bg-[#ea4335] shadow-xs" title="Gmail"></span>
                  <span className="w-3 h-3 rounded-full bg-[#1a73e8] shadow-xs" title="Calendar"></span>
                  <span className="w-3 h-3 rounded-full bg-[#0f9d58] shadow-xs" title="Drive"></span>
                  <span className="w-3 h-3 rounded-full bg-[#f9ab00] shadow-xs" title="Sheets"></span>
                  <span className="text-slate-600 font-mono text-xs font-medium">Gmail • Calendar • Drive • Sheets</span>
                </div>
              </div>
              <div className="border-t border-indigo-50 pt-4">
                <span className="font-mono text-xs uppercase tracking-wider text-indigo-500 font-semibold block mb-1">
                  Guarantees
                </span>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Zero middleware data persistence. End-to-end audit logging with millisecond execution timestamps.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Product Visual (Interactive Workbench with soft gradient framing) */}
      <section className="border-b border-indigo-100/70 bg-gradient-to-b from-[#F5F3FF]/60 via-[#EFF6FF]/40 to-white py-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex flex-wrap items-center justify-between mb-5 gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="font-mono text-xs uppercase tracking-wider text-slate-600 font-medium">
                FIGURE 1.0 — REAL-TIME WORKSPACE FLOW PIPELINE
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={triggerSimulation}
                disabled={isSimulating}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-xs px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>{isSimulating ? 'SIMULATING...' : 'RUN PIPELINE TEST'}</span>
              </button>
              <span className="font-mono text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                STATUS: SYSTEM_READY
              </span>
            </div>
          </div>

          {/* Workbench Frame */}
          <div className="bg-white border border-indigo-100 rounded-xl p-6 sm:p-8 font-mono text-xs shadow-md shadow-indigo-100/40">
            <div className="border-b border-slate-100 pb-4 mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full inline-block"></span>
                <span className="font-bold text-slate-900 text-sm font-sans">Active Workflow ID: wf_inv_2026_09</span>
              </div>
              <div className="flex items-center gap-5 text-slate-500 text-[11px]">
                <span className="bg-sky-50 text-sky-700 px-2 py-0.5 rounded border border-sky-100 font-medium">Trigger: INBOUND_EMAIL</span>
                <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-100 font-medium">Latency: 925ms</span>
                <span className="bg-pink-50 text-pink-700 px-2 py-0.5 rounded border border-pink-100 font-medium">Audit Ref: #AUD-99214</span>
              </div>
            </div>

            {/* Grid of Interactive Workflow Nodes */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {SAMPLE_WORKFLOW.steps.map((step) => {
                const isSelected = activeStep === step.stepNumber;
                return (
                  <button
                    key={step.stepNumber}
                    onClick={() => setActiveStep(step.stepNumber)}
                    className={`text-left p-5 rounded-lg border transition-all duration-200 relative ${
                      isSelected
                        ? 'border-indigo-600 bg-gradient-to-br from-indigo-50/70 via-white to-sky-50/50 shadow-md ring-2 ring-indigo-200 text-slate-950'
                        : 'border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50/50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-mono uppercase tracking-wider font-semibold ${isSelected ? 'text-indigo-700' : 'text-slate-500'}`}>
                        Step 0{step.stepNumber}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          step.service === 'gmail'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : step.service === 'drive'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : step.service === 'calendar'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {step.service}
                      </span>
                    </div>
                    <div className="font-sans font-bold text-sm mb-2 leading-snug text-slate-900">{step.title}</div>
                    <p className="text-[11px] font-sans leading-relaxed line-clamp-2 text-slate-600 mb-3">
                      {step.summary}
                    </p>
                    <div className="pt-2.5 border-t border-slate-100 text-[10px] flex justify-between text-slate-500">
                      <span className="font-semibold text-indigo-600">{step.latencyMs}ms</span>
                      <span className="text-emerald-600 font-semibold">OK 200</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Inspector drawer for selected step */}
            <div className="mt-6 bg-gradient-to-r from-[#F8FAFC] via-[#F5F3FF]/40 to-[#F0F9FF]/40 border border-indigo-100 rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2 font-sans">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                  Inspector: Step 0{activeStep} Payload Inspection
                </span>
                <span className="text-indigo-600 text-[11px] font-semibold">JSON Serialized Output</span>
              </div>
              <pre className="bg-white border border-slate-200/80 rounded-md p-4 text-[11px] text-slate-800 overflow-x-auto leading-relaxed shadow-xs">
{JSON.stringify(
  {
    step: activeStep,
    service: SAMPLE_WORKFLOW.steps[activeStep - 1].service,
    title: SAMPLE_WORKFLOW.steps[activeStep - 1].title,
    mapping: {
      key: SAMPLE_WORKFLOW.steps[activeStep - 1].payloadKey,
      value: SAMPLE_WORKFLOW.steps[activeStep - 1].payloadValue,
    },
    latency_ms: SAMPLE_WORKFLOW.steps[activeStep - 1].latencyMs,
    security_scope: 'OAUTH2_LEAST_PRIVILEGE',
    verification: 'PASSED_SIGNATURE_VERIFIED',
  },
  null,
  2
)}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Integrations Directory */}
      <section id="integrations" className="border-b border-indigo-50/80 py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="max-w-2xl mb-16">
            <span className="font-mono text-xs uppercase tracking-wider text-indigo-600 font-semibold block mb-2">
              Workspace Nodes
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 mb-4">
              Four Google services. Direct native API contracts.
            </h2>
            <p className="text-slate-600 text-lg">
              GWCC communicates directly with Google Workspace REST endpoints. No polling hacks. No middleman data silos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {WORKSPACE_SERVICES.map((srv) => (
              <div
                key={srv.id}
                className="border border-slate-200/90 rounded-xl p-6 flex flex-col justify-between hover:border-indigo-300 hover:shadow-md transition-all duration-200 bg-white"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-3.5 h-3.5 rounded-full shadow-xs" style={{ backgroundColor: srv.color }}></span>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500 font-medium">OAuth 2.0</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-950 mb-2">{srv.name}</h3>
                  <p className="text-sm text-slate-600 mb-6 leading-relaxed">{srv.description}</p>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-indigo-500 font-semibold block mb-2">
                    Supported Triggers
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {srv.eventsSupported.slice(0, 3).map((event, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                        <span>{event}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Connect → See → Automate Section with gradient wash (cyan → lavender → peach) */}
      <section id="how-it-works" className="border-b border-indigo-100/80 py-20 bg-gradient-to-r from-[#F0F9FF]/70 via-[#F5F3FF]/60 to-[#FFF7ED]/60">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="border-b border-indigo-100 pb-12 mb-16">
            <span className="font-mono text-xs uppercase tracking-wider text-indigo-600 font-semibold block mb-2">
              System Methodology
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950">
              Connect. See. Automate.
            </h2>
            <p className="text-slate-700 text-lg mt-3 max-w-xl">
              A structured lifecycle that brings governance and clarity to fragmented workspace operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {CORE_PILLARS.map((pillar) => (
              <div
                key={pillar.step}
                className="bg-white/95 border border-indigo-100 rounded-xl p-8 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="font-mono text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                    {pillar.step}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-950 mb-3">{pillar.name}</h3>
                  <p className="text-slate-700 text-sm mb-6 leading-relaxed font-medium">{pillar.tagline}</p>
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-3">
                  {pillar.details.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs text-slate-600 leading-normal">
                      <div className="w-4 h-4 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 text-indigo-700" />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Cross-Service Automation Example (Real-World Case Study) */}
      <section id="case-study" className="border-b border-indigo-100/80 py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <span className="font-mono text-xs uppercase tracking-wider text-indigo-600 font-semibold block mb-2">
                Real-World Execution
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 mb-6">
                From inbound PDF to scheduled payment in 925 milliseconds.
              </h2>
              <p className="text-slate-600 text-base leading-relaxed mb-6">
                In most organizations, vendor invoices require manually downloading an attachment, searching Drive for the right folder, opening Calendar to mark a review date, and typing row updates into an expense Sheet.
              </p>
              <p className="text-slate-600 text-base leading-relaxed mb-8">
                GWCC treats this as a single deterministic chain. If any step fails, the transaction halts safely, triggers a rollback notification, and maintains full audit integrity.
              </p>

              <div className="flex items-center gap-4 text-xs font-mono text-slate-600">
                <span className="flex items-center gap-1.5 font-medium">
                  <Shield className="w-3.5 h-3.5 text-indigo-600" />
                  Audit Verifiable
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Terminal className="w-3.5 h-3.5 text-indigo-600" />
                  Zero Third-party Storage
                </span>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="border border-slate-800 bg-[#0F172A] text-slate-200 p-6 sm:p-8 font-mono text-xs rounded-xl shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                  <span className="text-slate-400 uppercase tracking-wider text-[11px] font-semibold">Execution Timeline</span>
                  <span className="text-emerald-400 text-[11px] font-semibold">STATUS: COMPLETED (4/4)</span>
                </div>

                <div className="space-y-6">
                  <div className="flex gap-4 items-start">
                    <span className="text-slate-500 font-mono">00:00:00</span>
                    <div>
                      <div className="text-white font-bold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
                        <span>[Gmail Event] Inbound Invoice Detected</span>
                      </div>
                      <div className="text-slate-400 text-[11px] mt-1">From: billing@meridian-supplies.com | Size: 1.2MB PDF</div>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <span className="text-slate-500 font-mono">00:00:14</span>
                    <div>
                      <div className="text-white font-bold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                        <span>[Drive Storage] Commit to /Finance/2026/Q3/Payables</span>
                      </div>
                      <div className="text-slate-400 text-[11px] mt-1">File ID: 0B12xA9_DriveFinance2026 | SHA256: 7f83b165...</div>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <span className="text-slate-500 font-mono">00:00:52</span>
                    <div>
                      <div className="text-white font-bold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
                        <span>[Calendar Event] Scheduled Review Checkpoint</span>
                      </div>
                      <div className="text-slate-400 text-[11px] mt-1">Event: &quot;Review Meridian Invoice #089&quot; | Date: T+3 Days</div>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <span className="text-slate-500 font-mono">00:00:73</span>
                    <div>
                      <div className="text-white font-bold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                        <span>[Sheets Append] Ledger Row Inserted</span>
                      </div>
                      <div className="text-slate-400 text-[11px] mt-1">Range: AccountsPayable!A128:G128 | Amount: $14,250.00 USD</div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between text-slate-400 text-[10px]">
                  <span>EXECUTION TIME: 925ms</span>
                  <span>ENCRYPTION: AES-256 GCM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Short Explanation of Why GWCC Exists (Peach / lavender subtle wash) */}
      <section className="border-b border-indigo-100/70 py-20 bg-gradient-to-br from-[#FFF7ED]/50 via-[#FDF2F8]/30 to-[#F5F3FF]/40">
        <div className="max-w-4xl mx-auto px-6 sm:px-8">
          <span className="font-mono text-xs uppercase tracking-wider text-indigo-600 font-semibold block mb-3">
            Manifesto
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 mb-6">
            Why we built Google Workspace Command Center
          </h2>
          <div className="space-y-4 text-slate-700 text-lg leading-relaxed">
            <p>
              Google Workspace powers hundreds of millions of daily business interactions across Gmail, Calendar, Drive, and Sheets. Yet, it operates as four disconnected browser tabs.
            </p>
            <p>
              When a project begins, teams manually bridge the gap between emails, shared folders, calendars, and spreadsheets. Third-party automation tools require handing over sensitive API keys to proprietary cloud relays with vague security policies.
            </p>
            <p className="font-semibold text-slate-950">
              GWCC was built on a simple premise: your workspace tools already have the necessary infrastructure. What they lack is an authoritative command layer that orchestrates them directly, deterministically, and with complete internal auditability.
            </p>
          </div>
        </div>
      </section>

      {/* 8. Final CTA with energetic vibrant gradient button */}
      <section id="get-started" className="border-b border-indigo-100/70 py-24 bg-gradient-to-r from-[#EFF6FF] via-[#F5F3FF] to-[#FDF2F8]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-950 mb-6">
            Ready to unify your workspace?
          </h2>
          <p className="text-lg text-slate-600 max-w-xl mx-auto mb-10">
            Set up your organization&apos;s command center. Connect Gmail, Drive, Calendar, and Sheets with single sign-on.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white px-8 py-4 rounded-xl hover:shadow-xl hover:shadow-indigo-200 transition-all text-sm font-semibold tracking-wide flex items-center gap-2">
              <span>Start Workspace Connection</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="bg-white border border-slate-300 text-slate-800 px-8 py-4 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium shadow-xs">
              Read Security Whitepaper
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-500 font-mono">
            <span>Direct Google OAuth</span>
            <span>•</span>
            <span>Self-Hosted Ready</span>
            <span>•</span>
            <span>Zero Third-Party Relays</span>
          </div>
        </div>
      </section>

      {/* 9. Minimal Semantic Footer */}
      <footer className="py-12 bg-white text-slate-600 text-xs font-mono">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-950 text-sm font-sans tracking-tight">GWCC</span>
            <span className="text-slate-300">|</span>
            <span>Google Workspace Command Center</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#platform" className="hover:text-indigo-600 transition-colors">Platform</a>
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How it works</a>
            <a href="#integrations" className="hover:text-indigo-600 transition-colors">Integrations</a>
            <a href="#case-study" className="hover:text-indigo-600 transition-colors">Case Study</a>
          </div>

          <div className="text-slate-400">
            © 2026 GWCC. Engineered for Google Workspace.
          </div>
        </div>
      </footer>
    </div>
  );
};
