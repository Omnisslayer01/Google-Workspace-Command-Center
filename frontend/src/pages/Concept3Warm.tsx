import React from 'react';
import { WORKSPACE_SERVICES, CORE_PILLARS } from '../data/mockWorkspaceData';
import { ArrowRight } from 'lucide-react';

export const Concept3Warm: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1917] font-sans selection:bg-[#C25E34] selection:text-white pb-24">
      {/* 1. Minimal Navigation */}
      <header className="border-b border-[#E5DEC9] bg-[#FAF7F2]/90 sticky top-0 z-40 backdrop-blur-xs">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <a href="#top" className="flex items-center gap-3">
              <span className="font-serif text-2xl tracking-tight text-[#1C1917] italic font-medium">GWCC</span>
              <span className="text-[11px] uppercase tracking-widest text-[#78716C] font-mono border-l border-[#E5DEC9] pl-3">
                Command Center
              </span>
            </a>

            <nav className="hidden md:flex items-center gap-8 text-sm text-[#57534E]">
              <a href="#atelier" className="hover:text-[#1C1917] transition-colors">Philosophy</a>
              <a href="#integrations" className="hover:text-[#1C1917] transition-colors">Services</a>
              <a href="#how-it-works" className="hover:text-[#1C1917] transition-colors">Methodology</a>
              <a href="#letter" className="hover:text-[#1C1917] transition-colors">Why It Exists</a>
            </nav>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <button className="text-[#57534E] hover:text-[#1C1917] font-medium transition-colors">
              Sign In
            </button>
            <a
              href="#get-started"
              className="bg-[#292524] text-[#FAF7F2] px-5 py-2.5 rounded-sm hover:bg-[#1C1917] transition-colors text-xs uppercase tracking-widest font-semibold"
            >
              Get Started
            </a>
          </div>
        </div>
      </header>

      {/* 2. Hero Section (Warm, calm, editorial human tone) */}
      <section id="top" className="pt-20 pb-20 sm:pt-28 sm:pb-28">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-xs uppercase font-mono tracking-widest text-[#78716C] block mb-6">
            A quieter way to operate Google Workspace
          </span>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif text-[#1C1917] font-normal leading-[1.08] tracking-tight mb-8">
            Work that flows quietly.
            <br />
            <span className="italic text-[#78716C]">Without the constant tab-switching.</span>
          </h1>

          <p className="text-lg sm:text-xl text-[#57534E] max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Bring Gmail, Calendar, Drive, and Sheets into a single, cohesive command environment — turning manual coordination into peaceful, dependable workflows.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-5">
            <a
              href="#get-started"
              className="bg-[#292524] text-[#FAF7F2] px-7 py-3.5 rounded-sm hover:bg-[#1C1917] transition-colors text-sm font-medium tracking-wide flex items-center gap-2"
            >
              <span>Explore The Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#atelier"
              className="border border-[#D6CEBC] text-[#44403C] hover:bg-[#F2ECE1] px-7 py-3.5 rounded-sm transition-colors text-sm font-medium"
            >
              Read The Perspective
            </a>
          </div>
        </div>
      </section>

      {/* 3. Product Visual (Architectural Composition / Plate) */}
      <section id="atelier" className="max-w-5xl mx-auto px-6 mb-28">
        <div className="border border-[#E5DEC9] bg-[#F5EFE6] p-8 sm:p-12 rounded-sm shadow-xs">
          <div className="flex items-center justify-between border-b border-[#DCD3BE] pb-4 mb-8">
            <span className="font-serif italic text-lg text-[#1C1917]">Plate 1.0 — Unified Workflow Fabric</span>
            <span className="text-[11px] font-mono uppercase text-[#78716C] tracking-widest">Cross-Service Orchestration</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1: Mail */}
            <div className="bg-[#FAF7F2] border border-[#E5DEC9] p-6 rounded-sm">
              <span className="font-mono text-xs text-[#A8A29E] block mb-2">01. INGESTION</span>
              <h3 className="font-serif text-lg font-medium text-[#1C1917] mb-2">Inbound Invoice</h3>
              <p className="text-xs text-[#57534E] leading-relaxed mb-4">
                Gmail automatically identifies incoming PDF statements from verified suppliers without manual inbox triage.
              </p>
              <div className="font-mono text-[10px] text-[#78716C] bg-[#F2ECE1] p-2 rounded">
                gmail:attachments/invoice_089.pdf
              </div>
            </div>

            {/* Step 2: Drive & Calendar */}
            <div className="bg-[#FAF7F2] border border-[#E5DEC9] p-6 rounded-sm">
              <span className="font-mono text-xs text-[#A8A29E] block mb-2">02. ARCHIVE & SCHEDULE</span>
              <h3 className="font-serif text-lg font-medium text-[#1C1917] mb-2">Drive & Calendar</h3>
              <p className="text-xs text-[#57534E] leading-relaxed mb-4">
                The document is cataloged into the quarterly finance directory while a calendar deadline is reserved for approval.
              </p>
              <div className="font-mono text-[10px] text-[#78716C] bg-[#F2ECE1] p-2 rounded">
                drive:/Finance/2026 • cal:Due+3d
              </div>
            </div>

            {/* Step 3: Ledger */}
            <div className="bg-[#FAF7F2] border border-[#E5DEC9] p-6 rounded-sm">
              <span className="font-mono text-xs text-[#A8A29E] block mb-2">03. AUDIT & LOG</span>
              <h3 className="font-serif text-lg font-medium text-[#1C1917] mb-2">Ledger Update</h3>
              <p className="text-xs text-[#57534E] leading-relaxed mb-4">
                A verified reconciliation entry is appended to Sheets, creating an immutable history of every action.
              </p>
              <div className="font-mono text-[10px] text-[#78716C] bg-[#F2ECE1] p-2 rounded">
                sheets:Ledger!Row128 [Verified]
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-[#DCD3BE] flex flex-wrap items-center justify-between text-xs text-[#78716C] font-mono gap-4">
            <span>DIRECT OAUTH 2.0 TO GOOGLE CLOUD APIS</span>
            <span>END-TO-END WORKSPACE TRACEABILITY</span>
          </div>
        </div>
      </section>

      {/* 4. Integrations Atelier */}
      <section id="integrations" className="max-w-5xl mx-auto px-6 py-20 border-t border-[#E5DEC9]">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-xs uppercase font-mono tracking-widest text-[#78716C] block mb-2">Native Synergy</span>
          <h2 className="text-3xl sm:text-4xl font-serif text-[#1C1917] font-normal mb-3">
            Designed for the four services you rely on daily.
          </h2>
          <p className="text-[#57534E] text-sm leading-relaxed">
            No redundant proprietary databases. GWCC speaks directly to your native Google Workspace resources.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {WORKSPACE_SERVICES.map((srv) => (
            <div key={srv.id} className="border border-[#E5DEC9] bg-[#FAF7F2] p-8 rounded-sm hover:border-[#D6CEBC] transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="font-serif text-xl font-medium text-[#1C1917]">{srv.name}</span>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: srv.color }}></span>
              </div>
              <p className="text-sm text-[#57534E] leading-relaxed mb-6 font-light">{srv.description}</p>
              
              <div className="border-t border-[#EFE9DC] pt-4">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#A8A29E] block mb-2">Supported Flow Events</span>
                <ul className="text-xs text-[#78716C] space-y-1 font-mono">
                  {srv.eventsSupported.slice(0, 3).map((event, i) => (
                    <li key={i}>— {event}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Connect → See → Automate Section */}
      <section id="how-it-works" className="py-24 bg-[#F5EFE6] border-y border-[#E5DEC9]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-2xl mb-16">
            <span className="text-xs uppercase font-mono tracking-widest text-[#78716C] block mb-2">Three Disciplines</span>
            <h2 className="text-3xl sm:text-4xl font-serif text-[#1C1917] font-normal">
              Connect. See. Automate.
            </h2>
            <p className="text-[#57534E] text-base mt-2">
              A deliberate methodology to bring peace and predictability to modern office workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {CORE_PILLARS.map((pillar) => (
              <div key={pillar.step} className="bg-[#FAF7F2] border border-[#E5DEC9] p-8 rounded-sm">
                <span className="font-serif italic text-3xl text-[#78716C] block mb-4">{pillar.step}</span>
                <h3 className="font-serif text-xl font-medium text-[#1C1917] mb-3">{pillar.name}</h3>
                <p className="text-xs text-[#57534E] leading-relaxed mb-6 font-light">{pillar.tagline}</p>
                <div className="border-t border-[#EFE9DC] pt-4 space-y-2">
                  {pillar.details.map((item, idx) => (
                    <p key={idx} className="text-xs text-[#78716C] leading-snug">
                      • {item}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Cross-Service Automation Example */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-6">
            <span className="text-xs uppercase font-mono tracking-widest text-[#78716C] block mb-3">Narrative Workflow</span>
            <h2 className="text-3xl sm:text-4xl font-serif text-[#1C1917] font-normal leading-tight mb-6">
              The anatomy of an automated invoice workflow.
            </h2>
            <div className="space-y-4 text-[#57534E] text-base leading-relaxed font-light">
              <p>
                Every month, dozens of vendor receipts are delivered via email. Someone opens each message, downloads the file, navigates Drive folders, creates a reminder on Calendar, and enters figures in a spreadsheet.
              </p>
              <p>
                GWCC handles this sequence calmly behind the scenes. You set the guidelines once; the system verifies permissions, runs each step cleanly, and notifies you only when a human decision is needed.
              </p>
            </div>
          </div>

          <div className="md:col-span-6 bg-[#F5EFE6] border border-[#E5DEC9] p-8 rounded-sm">
            <h3 className="font-serif italic text-lg text-[#1C1917] mb-4">A typical sequence:</h3>
            <div className="space-y-4 text-xs text-[#57534E]">
              <div className="flex gap-3 items-start">
                <span className="font-mono text-[#78716C]">01</span>
                <div>
                  <strong className="text-[#1C1917] block">Gmail Detection:</strong>
                  Vendor invoice arrives from an approved supplier address.
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <span className="font-mono text-[#78716C]">02</span>
                <div>
                  <strong className="text-[#1C1917] block">Drive Preservation:</strong>
                  PDF is validated and archived directly to the designated Drive directory.
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <span className="font-mono text-[#78716C]">03</span>
                <div>
                  <strong className="text-[#1C1917] block">Calendar Commitment:</strong>
                  A 30-minute review task is slotted onto the finance calendar prior to the due date.
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <span className="font-mono text-[#78716C]">04</span>
                <div>
                  <strong className="text-[#1C1917] block">Audit Recording:</strong>
                  Row appended in Google Sheets with complete execution metadata.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Short Explanation of Why GWCC Exists (A Letter from the Team) */}
      <section id="letter" className="bg-[#F5EFE6] border-y border-[#E5DEC9] py-20">
        <div className="max-w-3xl mx-auto px-6">
          <span className="text-xs uppercase font-mono tracking-widest text-[#78716C] block mb-4">Letter from the Creators</span>
          <h2 className="text-2xl sm:text-3xl font-serif text-[#1C1917] font-normal mb-6">
            On the friction of modern office software.
          </h2>
          <div className="space-y-4 text-[#57534E] text-base leading-relaxed font-light">
            <p>
              Google Workspace gave us the tools to run global organizations in our web browsers. But in doing so, it left us with dozens of open tabs and a subtle, persistent cognitive tax.
            </p>
            <p>
              We found ourselves copying URLs between Gmail and Drive, setting manual calendar alarms for emails, and updating sheets by hand. The tools were capable, but they were not in dialogue.
            </p>
            <p>
              We designed GWCC not to replace Google Workspace, but to complete it. By creating a calm command center that bridges these tools, we hope to return your focus to meaningful work.
            </p>
          </div>
        </div>
      </section>

      {/* 8. Final CTA */}
      <section id="get-started" className="py-24 text-center max-w-2xl mx-auto px-6">
        <h2 className="text-3xl sm:text-4xl font-serif text-[#1C1917] font-normal mb-4">
          Experience a quieter workspace.
        </h2>
        <p className="text-base text-[#57534E] mb-8 font-light">
          Begin orchestrating your Google Workspace with clarity and confidence.
        </p>
        <div className="flex justify-center gap-4">
          <button className="bg-[#292524] text-[#FAF7F2] px-8 py-3.5 rounded-sm hover:bg-[#1C1917] transition-colors text-sm font-medium">
            Connect Google Workspace
          </button>
        </div>
      </section>

      {/* 9. Minimal Footer */}
      <footer className="py-10 border-t border-[#E5DEC9] text-center text-xs font-serif text-[#78716C]">
        GWCC — Google Workspace Command Center • Built with care for thoughtful teams.
      </footer>
    </div>
  );
};
