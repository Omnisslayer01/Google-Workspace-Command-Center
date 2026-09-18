import React, { useState } from 'react';
import { WORKSPACE_SERVICES, SAMPLE_WORKFLOW, CORE_PILLARS } from '../data/mockWorkspaceData';
import { ArrowRight, Check, Terminal, Shield } from 'lucide-react';

export const Concept1Editorial: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);

  return (
    <div className="min-h-screen bg-white text-zinc-950 font-sans selection:bg-zinc-900 selection:text-white pb-24">
      {/* 1. Minimal Navigation */}
      <header className="border-b border-zinc-200 sticky top-0 bg-white/95 backdrop-blur-none z-40">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="#top" className="flex items-center gap-2 font-bold tracking-tighter text-lg text-zinc-950">
              <span className="inline-block w-3 h-3 bg-zinc-950"></span>
              <span>GWCC</span>
              <span className="text-[10px] uppercase font-mono tracking-widest px-1.5 py-0.5 bg-zinc-100 text-zinc-600 rounded">
                v1.0
              </span>
            </a>

            <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-600 font-medium">
              <a href="#platform" className="hover:text-zinc-950 transition-colors">Platform</a>
              <a href="#how-it-works" className="hover:text-zinc-950 transition-colors">How it works</a>
              <a href="#integrations" className="hover:text-zinc-950 transition-colors">Integrations</a>
              <a href="#case-study" className="hover:text-zinc-950 transition-colors">Case Study</a>
            </nav>
          </div>

          <div className="flex items-center gap-4 text-sm font-medium">
            <button className="text-zinc-600 hover:text-zinc-950 px-3 py-1.5 transition-colors">
              Sign in
            </button>
            <a
              href="#get-started"
              className="bg-zinc-950 text-white px-4 py-2 hover:bg-zinc-800 transition-colors text-xs uppercase tracking-wider font-semibold"
            >
              Get started
            </a>
          </div>
        </div>
      </header>

      {/* 2. Hero Section (Asymmetric & Strong Swiss Typography) */}
      <section id="top" className="border-b border-zinc-200 pt-20 pb-16 sm:pt-28 sm:pb-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2 font-mono text-xs text-zinc-500 uppercase tracking-widest mb-6">
                <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span>
                <span>Google Workspace Orchestration System</span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-zinc-950 leading-[1.04] mb-8">
                Your entire workspace.
                <br />
                <span className="text-zinc-400 font-normal">One command center.</span>
              </h1>

              <p className="text-xl sm:text-2xl text-zinc-700 leading-relaxed font-normal max-w-2xl">
                Bring Gmail, Calendar, Drive and Sheets into one place — and turn repetitive work into connected workflows.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <a
                  href="#get-started"
                  className="bg-zinc-950 text-white px-6 py-3.5 hover:bg-zinc-800 transition-colors text-sm font-semibold tracking-wide flex items-center gap-2"
                >
                  <span>Deploy Command Center</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#how-it-works"
                  className="border border-zinc-300 text-zinc-800 px-6 py-3.5 hover:bg-zinc-50 transition-colors text-sm font-medium"
                >
                  Explore Architectural Flow
                </a>
              </div>
            </div>

            {/* Asymmetric Metadata Column */}
            <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-zinc-200 pt-8 lg:pt-0 lg:pl-8 space-y-6 text-sm">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-zinc-400 block mb-1">Architecture</span>
                <p className="font-medium text-zinc-900">Direct OAuth Service Bus & Celery Queue</p>
              </div>
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-zinc-400 block mb-1">Supported Services</span>
                <div className="flex gap-2 items-center mt-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ea4335]" title="Gmail"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1a73e8]" title="Calendar"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0f9d58]" title="Drive"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f9ab00]" title="Sheets"></span>
                  <span className="text-zinc-600 font-mono text-xs">Gmail • Calendar • Drive • Sheets</span>
                </div>
              </div>
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-zinc-400 block mb-1">Guarantees</span>
                <p className="text-zinc-600 leading-snug">Zero middleware data persistence. End-to-end audit logging with millisecond execution timestamps.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Product Visual (Integrated Architectural Schematic) */}
      <section className="border-b border-zinc-200 bg-zinc-50 py-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">
              FIGURE 1.0 — REAL-TIME WORKSPACE FLOW PIPELINE
            </span>
            <span className="font-mono text-xs text-zinc-500">STATUS: SYSTEM_READY</span>
          </div>

          {/* Precision Wireframe Schematic */}
          <div className="bg-white border border-zinc-300 p-6 sm:p-10 font-mono text-xs shadow-sm">
            <div className="border-b border-zinc-200 pb-4 mb-8 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 bg-emerald-600 inline-block"></span>
                <span className="font-semibold text-zinc-900 text-sm">Active Workflow ID: wf_inv_2026_09</span>
              </div>
              <div className="flex items-center gap-6 text-zinc-500">
                <span>Trigger: INBOUND_EMAIL</span>
                <span>Latency: 925ms</span>
                <span>Audit Ref: #AUD-99214</span>
              </div>
            </div>

            {/* Grid of Workflow Nodes */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {SAMPLE_WORKFLOW.steps.map((step) => {
                const isSelected = activeStep === step.stepNumber;
                return (
                  <button
                    key={step.stepNumber}
                    onClick={() => setActiveStep(step.stepNumber)}
                    className={`text-left p-5 border transition-all duration-150 ${
                      isSelected
                        ? 'border-zinc-950 bg-zinc-950 text-white ring-1 ring-zinc-950'
                        : 'border-zinc-200 bg-white hover:border-zinc-400 text-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-mono uppercase tracking-widest ${isSelected ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        Step 0{step.stepNumber}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-100 text-zinc-700'
                        }`}
                      >
                        {step.service}
                      </span>
                    </div>
                    <div className="font-sans font-bold text-sm mb-2 leading-snug">{step.title}</div>
                    <p className={`text-[11px] font-sans leading-relaxed line-clamp-2 ${isSelected ? 'text-zinc-300' : 'text-zinc-600'}`}>
                      {step.summary}
                    </p>
                    <div className={`mt-4 pt-3 border-t text-[10px] flex justify-between ${isSelected ? 'border-zinc-800 text-zinc-400' : 'border-zinc-100 text-zinc-500'}`}>
                      <span>{step.latencyMs}ms</span>
                      <span>OK 200</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Inspection drawer for selected step */}
            <div className="mt-8 bg-zinc-50 border border-zinc-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-zinc-900 uppercase tracking-wider text-[11px]">
                  Inspector: Step 0{activeStep} Payload Inspection
                </span>
                <span className="text-zinc-500 text-[11px]">JSON Serialized Output</span>
              </div>
              <pre className="bg-white border border-zinc-200 p-4 text-[11px] text-zinc-800 overflow-x-auto leading-relaxed">
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
      <section id="integrations" className="border-b border-zinc-200 py-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="max-w-2xl mb-16">
            <span className="font-mono text-xs uppercase tracking-widest text-zinc-400 block mb-2">Workspace Nodes</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 mb-4">
              Four Google services. Direct native API contracts.
            </h2>
            <p className="text-zinc-600 text-lg">
              GWCC communicates directly with Google Workspace REST endpoints. No polling hacks. No middleman data silos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {WORKSPACE_SERVICES.map((srv) => (
              <div key={srv.id} className="border border-zinc-200 p-6 flex flex-col justify-between hover:border-zinc-400 transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: srv.color }}></span>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">OAuth 2.0</span>
                  </div>
                  <h3 className="text-xl font-bold text-zinc-950 mb-2">{srv.name}</h3>
                  <p className="text-sm text-zinc-600 mb-6 leading-relaxed">{srv.description}</p>
                </div>

                <div className="border-t border-zinc-100 pt-4">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 block mb-2">Supported Triggers</span>
                  <ul className="space-y-1.5 text-xs text-zinc-700">
                    {srv.eventsSupported.slice(0, 3).map((event, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-zinc-400 rounded-full"></span>
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

      {/* 5. Connect → See → Automate Section */}
      <section id="how-it-works" className="border-b border-zinc-200 py-20 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="border-b border-zinc-200 pb-12 mb-16">
            <span className="font-mono text-xs uppercase tracking-widest text-zinc-400 block mb-2">System Methodology</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950">
              Connect. See. Automate.
            </h2>
            <p className="text-zinc-600 text-lg mt-3 max-w-xl">
              A structured lifecycle that brings governance and clarity to fragmented workspace operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {CORE_PILLARS.map((pillar) => (
              <div key={pillar.step} className="bg-white border border-zinc-200 p-8 flex flex-col justify-between">
                <div>
                  <div className="font-mono text-4xl font-extrabold text-zinc-300 mb-4">{pillar.step}</div>
                  <h3 className="text-2xl font-bold text-zinc-950 mb-3">{pillar.name}</h3>
                  <p className="text-zinc-700 text-sm mb-6 leading-relaxed font-medium">{pillar.tagline}</p>
                </div>

                <div className="border-t border-zinc-100 pt-4 space-y-3">
                  {pillar.details.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs text-zinc-600 leading-normal">
                      <Check className="w-3.5 h-3.5 text-zinc-950 shrink-0 mt-0.5" />
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
      <section id="case-study" className="border-b border-zinc-200 py-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <span className="font-mono text-xs uppercase tracking-widest text-zinc-400 block mb-2">Real-World Execution</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 mb-6">
                From inbound PDF to scheduled payment in 925 milliseconds.
              </h2>
              <p className="text-zinc-600 text-base leading-relaxed mb-6">
                In most organizations, vendor invoices require manually downloading an attachment, searching Drive for the right folder, opening Calendar to mark a review date, and typing row updates into an expense Sheet.
              </p>
              <p className="text-zinc-600 text-base leading-relaxed mb-8">
                GWCC treats this as a single deterministic chain. If any step fails, the transaction halts safely, triggers a rollback notification, and maintains full audit integrity.
              </p>

              <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-zinc-950" />
                  Audit Verifiable
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-zinc-950" />
                  Zero Third-party Storage
                </span>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="border border-zinc-900 bg-zinc-950 text-zinc-200 p-6 sm:p-8 font-mono text-xs shadow-lg">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
                  <span className="text-zinc-400 uppercase tracking-wider text-[11px]">Execution Timeline</span>
                  <span className="text-emerald-400 text-[11px]">STATUS: COMPLETED (4/4)</span>
                </div>

                <div className="space-y-6">
                  <div className="flex gap-4 items-start">
                    <span className="text-zinc-500">00:00:00</span>
                    <div>
                      <div className="text-white font-bold">[Gmail Event] Inbound Invoice Detected</div>
                      <div className="text-zinc-400 text-[11px] mt-1">From: billing@meridian-supplies.com | Size: 1.2MB PDF</div>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <span className="text-zinc-500">00:00:14</span>
                    <div>
                      <div className="text-white font-bold">[Drive Storage] Commit to /Finance/2026/Q3/Payables</div>
                      <div className="text-zinc-400 text-[11px] mt-1">File ID: 0B12xA9_DriveFinance2026 | SHA256: 7f83b165...</div>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <span className="text-zinc-500">00:00:52</span>
                    <div>
                      <div className="text-white font-bold">[Calendar Event] Scheduled Review Checkpoint</div>
                      <div className="text-zinc-400 text-[11px] mt-1">Event: &quot;Review Meridian Invoice #089&quot; | Date: T+3 Days</div>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <span className="text-zinc-500">00:00:73</span>
                    <div>
                      <div className="text-white font-bold">[Sheets Append] Ledger Row Inserted</div>
                      <div className="text-zinc-400 text-[11px] mt-1">Range: AccountsPayable!A128:G128 | Amount: $14,250.00 USD</div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-zinc-800 flex items-center justify-between text-zinc-500 text-[10px]">
                  <span>EXECUTION TIME: 925ms</span>
                  <span>ENCRYPTION: AES-256 GCM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Short Explanation of Why GWCC Exists */}
      <section className="border-b border-zinc-200 py-20 bg-zinc-50">
        <div className="max-w-4xl mx-auto px-6 sm:px-8">
          <span className="font-mono text-xs uppercase tracking-widest text-zinc-400 block mb-3">Manifesto</span>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950 mb-6">
            Why we built Google Workspace Command Center
          </h2>
          <div className="space-y-4 text-zinc-700 text-lg leading-relaxed">
            <p>
              Google Workspace powers hundreds of millions of daily business interactions across Gmail, Calendar, Drive, and Sheets. Yet, it operates as four disconnected browser tabs.
            </p>
            <p>
              When a project begins, teams manually bridge the gap between emails, shared folders, calendars, and spreadsheets. Third-party automation tools require handing over sensitive API keys to proprietary cloud relays with vague security policies.
            </p>
            <p className="font-medium text-zinc-950">
              GWCC was built on a simple premise: your workspace tools already have the necessary infrastructure. What they lack is an authoritative command layer that orchestrates them directly, deterministically, and with complete internal auditability.
            </p>
          </div>
        </div>
      </section>

      {/* 8. Final CTA */}
      <section id="get-started" className="border-b border-zinc-200 py-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 mb-6">
            Ready to unify your workspace?
          </h2>
          <p className="text-lg text-zinc-600 max-w-xl mx-auto mb-10">
            Set up your organization&apos;s command center. Connect Gmail, Drive, Calendar, and Sheets with single sign-on.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button className="bg-zinc-950 text-white px-8 py-4 hover:bg-zinc-800 transition-colors text-sm font-semibold tracking-wide flex items-center gap-2">
              <span>Start Workspace Connection</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="border border-zinc-300 text-zinc-800 px-8 py-4 hover:bg-zinc-50 transition-colors text-sm font-medium">
              Read Security Whitepaper
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-zinc-500 font-mono">
            <span>Direct Google OAuth</span>
            <span>•</span>
            <span>Self-Hosted Ready</span>
            <span>•</span>
            <span>Zero Third-Party Relays</span>
          </div>
        </div>
      </section>

      {/* 9. Minimal Footer */}
      <footer className="py-12 bg-white text-zinc-600 text-xs font-mono">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="font-bold text-zinc-950 text-sm font-sans tracking-tight">GWCC</span>
            <span className="text-zinc-300">|</span>
            <span>Google Workspace Command Center</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#platform" className="hover:text-zinc-950 transition-colors">Platform</a>
            <a href="#how-it-works" className="hover:text-zinc-950 transition-colors">How it works</a>
            <a href="#integrations" className="hover:text-zinc-950 transition-colors">Integrations</a>
            <a href="#case-study" className="hover:text-zinc-950 transition-colors">Case Study</a>
          </div>

          <div className="text-zinc-400">
            © 2026 GWCC. Engineered for Google Workspace.
          </div>
        </div>
      </footer>
    </div>
  );
};
