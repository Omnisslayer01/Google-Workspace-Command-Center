import React, { useState } from 'react';
import { getGoogleOAuthUrl } from '../../lib/api';
import { WORKSPACE_SERVICES, SAMPLE_WORKFLOW, CORE_PILLARS } from '../data/mockWorkspaceData';
import { ArrowRight, Check, Terminal, Shield, Play, Mail, HardDrive, Calendar, Table, CheckCircle2 } from 'lucide-react';

export const Concept5Workspace: React.FC = () => {
  
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  const handleGoogleConnect = async () => {
    setIsConnecting(true);
    setConnectError(null);
    try {
      const { auth_url } = await getGoogleOAuthUrl();
      if (auth_url) {
        window.location.href = auth_url;
      } else {
        throw new Error('Google OAuth URL was not returned by the backend.');
      }
    } catch (error: any) {
      console.error('Google connection failed:', error);
      setIsConnecting(false);
      setConnectError(
        error?.message ||
        'Failed to connect to backend server. Make sure Django is running: python manage.py runserver 8001'
      );
    }
  };


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

  // Google 4-color config per service
  const serviceConfigs = {
    gmail: {
      name: 'Gmail',
      color: '#ea4335',
      badgeBg: 'bg-red-50 text-[#c5221f] border-red-200',
      pillBg: 'bg-red-500',
      topBorder: 'border-t-4 border-t-[#ea4335]',
      leftBorder: 'border-l-4 border-l-[#ea4335]',
      icon: <Mail className="w-4 h-4 text-[#ea4335]" />,
    },
    drive: {
      name: 'Drive',
      color: '#fbbc04',
      badgeBg: 'bg-amber-50 text-[#b45309] border-amber-200',
      pillBg: 'bg-[#fbbc04]',
      topBorder: 'border-t-4 border-t-[#fbbc04]',
      leftBorder: 'border-l-4 border-l-[#fbbc04]',
      icon: <HardDrive className="w-4 h-4 text-[#b45309]" />,
    },
    calendar: {
      name: 'Calendar',
      color: '#1a73e8',
      badgeBg: 'bg-blue-50 text-[#1a73e8] border-blue-200',
      pillBg: 'bg-[#1a73e8]',
      topBorder: 'border-t-4 border-t-[#1a73e8]',
      leftBorder: 'border-l-4 border-l-[#1a73e8]',
      icon: <Calendar className="w-4 h-4 text-[#1a73e8]" />,
    },
    sheets: {
      name: 'Sheets',
      color: '#0f9d58',
      badgeBg: 'bg-emerald-50 text-[#0f9d58] border-emerald-200',
      pillBg: 'bg-[#0f9d58]',
      topBorder: 'border-t-4 border-t-[#0f9d58]',
      leftBorder: 'border-l-4 border-l-[#0f9d58]',
      icon: <Table className="w-4 h-4 text-[#0f9d58]" />,
    },
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-[#1a73e8] selection:text-white pb-24 antialiased">
      {/* Top 4-color accent hairline stripe */}
      <div className="grid grid-cols-4 h-1 w-full">
        <span className="bg-[#1a73e8]"></span>
        <span className="bg-[#ea4335]"></span>
        <span className="bg-[#fbbc04]"></span>
        <span className="bg-[#0f9d58]"></span>
      </div>

      {/* 1. Minimal Navigation (Clean Google-Workspace-inspired product header) */}
      <header className="border-b border-slate-200 sticky top-0 bg-white z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="#top" className="flex items-center gap-2.5 font-medium tracking-tight text-slate-900">
              {/* GWCC Geometric mark: clean enterprise command icon with prominent Google 4-color quadrants */}
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-1.5 shadow-2xs">
                <div className="grid grid-cols-2 gap-1 w-full h-full">
                  <span className="bg-[#1a73e8] rounded-[2px]" title="Workspace Blue"></span>
                  <span className="bg-[#ea4335] rounded-[2px]" title="Gmail Red"></span>
                  <span className="bg-[#fbbc04] rounded-[2px]" title="Drive Yellow"></span>
                  <span className="bg-[#0f9d58] rounded-[2px]" title="Sheets Green"></span>
                </div>
              </div>
              <span className="text-base font-bold tracking-tight text-slate-900">GWCC</span>
              <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                Workspace Edition
              </span>
            </a>

            <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600 font-medium">
              <a href="#platform" className="hover:text-[#1a73e8] transition-colors">Platform</a>
              <a href="#how-it-works" className="hover:text-[#1a73e8] transition-colors">How it works</a>
              <a href="#integrations" className="hover:text-[#1a73e8] transition-colors">Integrations</a>
              <a href="#case-study" className="hover:text-[#1a73e8] transition-colors">Case Study</a>
            </nav>
          </div>

          <div className="flex items-center gap-3 text-sm font-medium">
            <button
              onClick={handleGoogleConnect}
              disabled={isConnecting}
              className="text-slate-600 hover:text-[#1a73e8] px-3 py-1.5 transition-colors disabled:opacity-60 flex items-center gap-1.5 cursor-pointer"
            >
              {isConnecting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-[#1a73e8] border-t-transparent rounded-full animate-spin"></span>
                  <span>Connecting...</span>
                </>
              ) : (
                <span>Sign in</span>
              )}
            </button>
            <button
              onClick={handleGoogleConnect}
              disabled={isConnecting}
              className="bg-[#1a73e8] hover:bg-[#1557b0] text-white px-4 py-2 rounded-md transition-colors text-xs font-semibold tracking-wide shadow-xs disabled:opacity-60 cursor-pointer"
            >
              Get started
            </button>
          </div>
        </div>
      </header>

      {/* Connection Error Banner */}
      {connectError && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3.5 text-sm text-red-800 flex items-center justify-between sticky top-16 z-40">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
            <div>
              <span className="font-semibold">Backend Connection Notice: </span>
              <span>{connectError}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleGoogleConnect}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium cursor-pointer"
            >
              Retry
            </button>
            <button
              onClick={() => setConnectError(null)}
              className="px-2 py-1 text-red-600 hover:text-red-900 text-xs font-medium cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* 2. Hero Section (Predominantly white, Google Blue accent, visible 4-color service presence) */}
      <section id="top" className="border-b border-slate-100 pt-20 pb-16 sm:pt-28 sm:pb-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
            <div className="lg:col-span-8">
              {/* Eyebrow badge with four Google colors clearly visible */}
              <div className="inline-flex items-center gap-2.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-full mb-6 shadow-2xs">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#1a73e8]" title="Blue"></span>
                  <span className="w-2 h-2 rounded-full bg-[#ea4335]" title="Red"></span>
                  <span className="w-2 h-2 rounded-full bg-[#fbbc04]" title="Yellow"></span>
                  <span className="w-2 h-2 rounded-full bg-[#0f9d58]" title="Green"></span>
                </div>
                <span>Google Workspace Orchestration System</span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-slate-900 leading-[1.08] mb-8">
                Your entire workspace.
                <br />
                <span className="text-[#1a73e8]">One command center.</span>
              </h1>

              <p className="text-xl sm:text-2xl text-slate-600 leading-relaxed font-normal max-w-2xl mb-8">
                Bring Gmail, Calendar, Drive and Sheets into one place — and turn repetitive work into connected workflows.
              </p>

              {/* Four-color quick service indicator pills */}
              <div className="flex flex-wrap items-center gap-2.5 mb-10 text-xs font-medium">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-50 border border-red-200 text-[#c5221f]">
                  <Mail className="w-3.5 h-3.5 text-[#ea4335]" />
                  <span>Gmail • Ingestion</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-50 border border-amber-200 text-[#b45309]">
                  <HardDrive className="w-3.5 h-3.5 text-[#fbbc04]" />
                  <span>Drive • Storage</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-50 border border-blue-200 text-[#1a73e8]">
                  <Calendar className="w-3.5 h-3.5 text-[#1a73e8]" />
                  <span>Calendar • Deadlines</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-50 border border-emerald-200 text-[#0f9d58]">
                  <Table className="w-3.5 h-3.5 text-[#0f9d58]" />
                  <span>Sheets • Audit Ledger</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={handleGoogleConnect}
                  disabled={isConnecting}
                  className="bg-[#1a73e8] hover:bg-[#1557b0] text-white px-7 py-3.5 rounded-md transition-colors text-sm font-semibold tracking-wide flex items-center gap-2.5 shadow-sm disabled:opacity-60 cursor-pointer"
                >
                  {isConnecting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Connecting to Google...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                      </svg>
                      <span>Connect Google Workspace</span>
                      <ArrowRight className="w-4 h-4 ml-0.5" />
                    </>
                  )}
                </button>
                <a
                  href="#how-it-works"
                  className="bg-white border border-slate-300 text-slate-700 px-6 py-3.5 rounded-md hover:bg-slate-50 hover:border-slate-400 transition-colors text-sm font-medium"
                >
                  Explore Architectural Flow
                </a>
              </div>
            </div>

            {/* Asymmetric Metadata Column (Clean, white productivity card with top 4-color stripe) */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
              {/* 4-color top accent stripe */}
              <div className="grid grid-cols-4 h-1.5 w-full">
                <span className="bg-[#1a73e8]"></span>
                <span className="bg-[#ea4335]"></span>
                <span className="bg-[#fbbc04]"></span>
                <span className="bg-[#0f9d58]"></span>
              </div>

              <div className="p-6 sm:p-7 space-y-6 text-sm">
                <div>
                  <span className="font-mono text-xs uppercase tracking-wider text-slate-500 font-semibold block mb-1">
                    Architecture
                  </span>
                  <p className="font-semibold text-slate-900">Direct OAuth Service Bus & Celery Queue</p>
                </div>

                <div>
                  <span className="font-mono text-xs uppercase tracking-wider text-slate-500 font-semibold block mb-2">
                    Connected Ecosystem
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2 p-2 bg-red-50/70 border border-red-200 rounded">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ea4335]"></span>
                      <span className="font-medium text-slate-900">Gmail</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-blue-50/70 border border-blue-200 rounded">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#1a73e8]"></span>
                      <span className="font-medium text-slate-900">Calendar</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-amber-50/70 border border-amber-200 rounded">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#fbbc04]"></span>
                      <span className="font-medium text-slate-900">Drive</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-emerald-50/70 border border-emerald-200 rounded">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0f9d58]"></span>
                      <span className="font-medium text-slate-900">Sheets</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <span className="font-mono text-xs uppercase tracking-wider text-slate-500 font-semibold block mb-1">
                    Guarantees
                  </span>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Zero middleware data persistence. End-to-end audit logging with millisecond execution timestamps.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Product Visual (Clean productivity workbench with prominent service color coding) */}
      <section className="border-b border-slate-200 bg-[#f8f9fa] py-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex flex-wrap items-center justify-between mb-5 gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#0f9d58]"></span>
              <span className="font-mono text-xs uppercase tracking-wider text-slate-600 font-semibold">
                FIGURE 1.0 — REAL-TIME WORKSPACE FLOW PIPELINE
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={triggerSimulation}
                disabled={isSimulating}
                className="bg-[#1a73e8] hover:bg-[#1557b0] text-white font-mono text-xs px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors disabled:opacity-50 font-medium"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>{isSimulating ? 'SIMULATING...' : 'RUN PIPELINE TEST'}</span>
              </button>
              <span className="font-mono text-xs text-[#0f9d58] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>STATUS: SYSTEM_READY</span>
              </span>
            </div>
          </div>

          {/* Workbench Frame */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
            {/* Top 4-color hairline rule */}
            <div className="grid grid-cols-4 h-1 w-full">
              <span className="bg-[#1a73e8]"></span>
              <span className="bg-[#ea4335]"></span>
              <span className="bg-[#fbbc04]"></span>
              <span className="bg-[#0f9d58]"></span>
            </div>

            <div className="p-6 sm:p-8 font-mono text-xs">
              <div className="border-b border-slate-100 pb-4 mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 bg-[#1a73e8] rounded-full inline-block"></span>
                  <span className="font-bold text-slate-900 text-sm font-sans">Active Workflow ID: wf_inv_2026_09</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 text-[11px]">
                  <span className="bg-red-50 text-[#c5221f] px-2.5 py-1 rounded border border-red-200 font-medium">Trigger: INBOUND_EMAIL</span>
                  <span className="bg-blue-50 text-[#1a73e8] px-2.5 py-1 rounded border border-blue-200 font-medium">Latency: 925ms</span>
                  <span className="bg-emerald-50 text-[#0f9d58] px-2.5 py-1 rounded border border-emerald-200 font-medium">Audit Ref: #AUD-99214</span>
                </div>
              </div>

              {/* Grid of Workflow Nodes with prominent top color borders and icons */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {SAMPLE_WORKFLOW.steps.map((step) => {
                  const isSelected = activeStep === step.stepNumber;
                  const config = serviceConfigs[step.service as keyof typeof serviceConfigs] || serviceConfigs.gmail;

                  return (
                    <button
                      key={step.stepNumber}
                      onClick={() => setActiveStep(step.stepNumber)}
                      className={`text-left p-5 rounded-md border transition-all duration-150 relative bg-white ${config.topBorder} ${
                        isSelected
                          ? 'ring-2 ring-blue-200 shadow-md text-slate-900'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-xs font-mono uppercase tracking-wider font-bold ${isSelected ? 'text-[#1a73e8]' : 'text-slate-500'}`}>
                          Step 0{step.stepNumber}
                        </span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${config.badgeBg}`}>
                          {config.icon}
                          <span>{step.service}</span>
                        </span>
                      </div>
                      <div className="font-sans font-bold text-sm mb-4 leading-snug text-slate-900">{step.title}</div>
                      <div className="pt-2.5 border-t border-slate-100 text-[10px] flex justify-between text-slate-500 font-mono">
                        <span className="font-semibold text-slate-700">{step.latencyMs}ms</span>
                        <span className="text-[#0f9d58] font-bold">OK 200</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Supported Services / Integrations Directory (Distinct Four-Color Identity) */}
      <section id="integrations" className="border-b border-slate-200 py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="max-w-2xl mb-16">
            <span className="font-mono text-xs uppercase tracking-wider text-[#1a73e8] font-semibold block mb-2">
              Workspace Nodes
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-4">
              Four Google services. Direct native API contracts.
            </h2>
            <p className="text-slate-600 text-lg">
              GWCC communicates directly with Google Workspace REST endpoints. No polling hacks. No middleman data silos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {WORKSPACE_SERVICES.map((srv) => {
              // Exact 4-color treatment per card
              const srvStyle = {
                gmail: {
                  topAccent: 'border-t-4 border-t-[#ea4335]',
                  iconBg: 'bg-red-50 text-[#ea4335] border-red-200',
                  badge: 'bg-red-100/70 text-[#c5221f] border-red-200',
                  dot: 'bg-[#ea4335]',
                },
                calendar: {
                  topAccent: 'border-t-4 border-t-[#1a73e8]',
                  iconBg: 'bg-blue-50 text-[#1a73e8] border-blue-200',
                  badge: 'bg-blue-100/70 text-[#1a73e8] border-blue-200',
                  dot: 'bg-[#1a73e8]',
                },
                drive: {
                  topAccent: 'border-t-4 border-t-[#fbbc04]',
                  iconBg: 'bg-amber-50 text-[#b45309] border-amber-200',
                  badge: 'bg-amber-100/70 text-[#b45309] border-amber-200',
                  dot: 'bg-[#fbbc04]',
                },
                sheets: {
                  topAccent: 'border-t-4 border-t-[#0f9d58]',
                  iconBg: 'bg-emerald-50 text-[#0f9d58] border-emerald-200',
                  badge: 'bg-emerald-100/70 text-[#0f9d58] border-emerald-200',
                  dot: 'bg-[#0f9d58]',
                },
              }[srv.id];

              return (
                <div
                  key={srv.id}
                  className={`bg-white border border-slate-200 rounded-lg p-6 flex flex-col justify-between hover:border-slate-300 hover:shadow-sm transition-all duration-150 ${srvStyle.topAccent}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-3.5 h-3.5 rounded-full ${srvStyle.dot}`}></span>
                        <span className="font-bold text-slate-900 text-lg">{srv.name}</span>
                      </div>
                      <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded border ${srvStyle.badge}`}>
                        OAuth 2.0
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-6 leading-relaxed">{srv.description}</p>
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 font-semibold block mb-2">
                      Supported Triggers
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {srv.eventsSupported.slice(0, 3).map((event, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${srvStyle.dot}`}></span>
                          <span>{event}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Connect → See → Automate Section (Methodology with Four-Color Progression) */}
      <section id="how-it-works" className="border-b border-slate-200 py-20 bg-[#f8f9fa]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="border-b border-slate-200 pb-12 mb-16">
            <span className="font-mono text-xs uppercase tracking-wider text-[#1a73e8] font-semibold block mb-2">
              System Methodology
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              Connect. See. Automate.
            </h2>
            <p className="text-slate-600 text-lg mt-3 max-w-xl">
              A structured lifecycle that brings governance and clarity to fragmented workspace operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {CORE_PILLARS.map((pillar, pIdx) => {
              // Distinct accent color per pillar
              const pillarAccents = [
                {
                  numberColor: 'text-[#1a73e8]',
                  topBorder: 'border-t-4 border-t-[#1a73e8]',
                  badgeBg: 'bg-blue-50 border-blue-200 text-[#1a73e8]',
                },
                {
                  numberColor: 'text-[#b45309]',
                  topBorder: 'border-t-4 border-t-[#fbbc04]',
                  badgeBg: 'bg-amber-50 border-amber-200 text-[#b45309]',
                },
                {
                  numberColor: 'text-[#0f9d58]',
                  topBorder: 'border-t-4 border-t-[#0f9d58]',
                  badgeBg: 'bg-emerald-50 border-emerald-200 text-[#0f9d58]',
                },
              ][pIdx] || {
                numberColor: 'text-[#1a73e8]',
                topBorder: 'border-t-4 border-t-[#1a73e8]',
                badgeBg: 'bg-blue-50 border-blue-200 text-[#1a73e8]',
              };

              return (
                <div
                  key={pillar.step}
                  className={`bg-white border border-slate-200 rounded-lg p-8 flex flex-col justify-between shadow-xs ${pillarAccents.topBorder}`}
                >
                  <div>
                    <div className={`font-mono text-4xl font-bold mb-4 ${pillarAccents.numberColor}`}>
                      {pillar.step}
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">{pillar.name}</h3>
                    <p className="text-slate-600 text-sm mb-6 leading-relaxed font-medium">{pillar.tagline}</p>
                  </div>

                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    {pillar.details.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-xs text-slate-600 leading-normal">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${pillarAccents.badgeBg}`}>
                          <Check className="w-2.5 h-2.5" />
                        </div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Cross-Service Automation Example (Real-World Case Study with Connected Four Colors) */}
      <section id="case-study" className="border-b border-slate-200 py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <span className="font-mono text-xs uppercase tracking-wider text-[#1a73e8] font-semibold block mb-2">
                Real-World Execution
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-6">
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
                  <Shield className="w-3.5 h-3.5 text-[#1a73e8]" />
                  Audit Verifiable
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Terminal className="w-3.5 h-3.5 text-[#1a73e8]" />
                  Zero Third-party Storage
                </span>
              </div>
            </div>

            <div className="lg:col-span-7">
              {/* Clean high-contrast productivity execution panel with four-color left borders */}
              <div className="border border-slate-200 bg-[#f8f9fa] text-slate-800 p-6 sm:p-8 font-mono text-xs rounded-lg shadow-xs overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
                  <span className="text-slate-700 uppercase tracking-wider text-[11px] font-bold">Execution Timeline</span>
                  <span className="text-[#0f9d58] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-bold">
                    STATUS: COMPLETED (4/4)
                  </span>
                </div>

                <div className="space-y-6">
                  {/* Step 1: Gmail (Red) */}
                  <div className="flex gap-4 items-start">
                    <span className="text-slate-500 font-mono">00:00:00</span>
                    <div className="border-l-4 border-[#ea4335] bg-white p-3 rounded-r-md border-r border-t border-b border-slate-200 w-full shadow-2xs">
                      <div className="text-slate-900 font-bold flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-[#ea4335]" />
                          <span>[Gmail Event] Inbound Invoice Detected</span>
                        </span>
                        <span className="text-[10px] uppercase font-semibold text-[#c5221f] bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                          Gmail
                        </span>
                      </div>
                      <div className="text-slate-500 text-[11px] mt-1">From: billing@meridian-supplies.com | Size: 1.2MB PDF</div>
                    </div>
                  </div>

                  {/* Step 2: Drive (Yellow) */}
                  <div className="flex gap-4 items-start">
                    <span className="text-slate-500 font-mono">00:00:14</span>
                    <div className="border-l-4 border-[#fbbc04] bg-white p-3 rounded-r-md border-r border-t border-b border-slate-200 w-full shadow-2xs">
                      <div className="text-slate-900 font-bold flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <HardDrive className="w-3.5 h-3.5 text-[#fbbc04]" />
                          <span>[Drive Storage] Commit to /Finance/2026/Q3/Payables</span>
                        </span>
                        <span className="text-[10px] uppercase font-semibold text-[#b45309] bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          Drive
                        </span>
                      </div>
                      <div className="text-slate-500 text-[11px] mt-1">File ID: 0B12xA9_DriveFinance2026 | SHA256: 7f83b165...</div>
                    </div>
                  </div>

                  {/* Step 3: Calendar (Blue) */}
                  <div className="flex gap-4 items-start">
                    <span className="text-slate-500 font-mono">00:00:52</span>
                    <div className="border-l-4 border-[#1a73e8] bg-white p-3 rounded-r-md border-r border-t border-b border-slate-200 w-full shadow-2xs">
                      <div className="text-slate-900 font-bold flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#1a73e8]" />
                          <span>[Calendar Event] Scheduled Review Checkpoint</span>
                        </span>
                        <span className="text-[10px] uppercase font-semibold text-[#1a73e8] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                          Calendar
                        </span>
                      </div>
                      <div className="text-slate-500 text-[11px] mt-1">Event: &quot;Review Meridian Invoice #089&quot; | Date: T+3 Days</div>
                    </div>
                  </div>

                  {/* Step 4: Sheets (Green) */}
                  <div className="flex gap-4 items-start">
                    <span className="text-slate-500 font-mono">00:00:73</span>
                    <div className="border-l-4 border-[#0f9d58] bg-white p-3 rounded-r-md border-r border-t border-b border-slate-200 w-full shadow-2xs">
                      <div className="text-slate-900 font-bold flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Table className="w-3.5 h-3.5 text-[#0f9d58]" />
                          <span>[Sheets Append] Ledger Row Inserted</span>
                        </span>
                        <span className="text-[10px] uppercase font-semibold text-[#0f9d58] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          Sheets
                        </span>
                      </div>
                      <div className="text-slate-500 text-[11px] mt-1">Range: AccountsPayable!A128:G128 | Amount: $14,250.00 USD</div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-slate-500 text-[10px]">
                  <span>EXECUTION TIME: 925ms</span>
                  <span>ENCRYPTION: AES-256 GCM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Short Explanation of Why GWCC Exists (Clean manifesto with 4-color top border) */}
      <section className="border-b border-slate-200 py-20 bg-[#f8f9fa]">
        <div className="max-w-4xl mx-auto px-6 sm:px-8">
          <div className="bg-white border border-slate-200 rounded-lg p-8 sm:p-10 shadow-xs">
            <span className="font-mono text-xs uppercase tracking-wider text-[#1a73e8] font-semibold block mb-3">
              Manifesto
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-6">
              Why we built Google Workspace Command Center
            </h2>
            <div className="space-y-4 text-slate-600 text-lg leading-relaxed">
              <p>
                Google Workspace powers hundreds of millions of daily business interactions across Gmail, Calendar, Drive, and Sheets. Yet, it operates as four disconnected browser tabs.
              </p>
              <p>
                When a project begins, teams manually bridge the gap between emails, shared folders, calendars, and spreadsheets. Third-party automation tools require handing over sensitive API keys to proprietary cloud relays with vague security policies.
              </p>
              <p className="font-medium text-slate-900">
                GWCC was built on a simple premise: your workspace tools already have the necessary infrastructure. What they lack is an authoritative command layer that orchestrates them directly, deterministically, and with complete internal auditability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Final CTA (Predominantly white with Google Blue action button & 4-color accent pill) */}
      <section id="get-started" className="border-b border-slate-200 py-24 bg-white text-center">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          {/* Subtle 4-color pill */}
          <div className="inline-flex items-center gap-1.5 p-1 bg-slate-100 rounded-full border border-slate-200 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#1a73e8]"></span>
            <span className="w-2 h-2 rounded-full bg-[#ea4335]"></span>
            <span className="w-2 h-2 rounded-full bg-[#fbbc04]"></span>
            <span className="w-2 h-2 rounded-full bg-[#0f9d58]"></span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 mb-6">
            Ready to unify your workspace?
          </h2>
          <p className="text-lg text-slate-600 max-w-xl mx-auto mb-10">
            Set up your organization&apos;s command center. Connect Gmail, Drive, Calendar, and Sheets with single sign-on.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={handleGoogleConnect}
              disabled={isConnecting}
              className="bg-[#1a73e8] hover:bg-[#1557b0] text-white px-8 py-4 rounded-md transition-colors text-sm font-semibold tracking-wide flex items-center gap-2 shadow-xs disabled:opacity-60 cursor-pointer"
            >
              {isConnecting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <span>Start Workspace Connection</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <button className="bg-white border border-slate-300 text-slate-700 px-8 py-4 rounded-md hover:bg-slate-50 hover:border-slate-400 transition-colors text-sm font-medium">
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

      {/* 9. Minimal Semantic Footer with 4-color indicator */}
      <footer className="py-12 bg-white text-slate-500 text-xs font-mono">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1a73e8]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#ea4335]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#fbbc04]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#0f9d58]"></span>
            </div>
            <span className="font-bold text-slate-900 text-sm font-sans tracking-tight">GWCC</span>
            <span className="text-slate-300">|</span>
            <span>Google Workspace Command Center</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#platform" className="hover:text-[#1a73e8] transition-colors">Platform</a>
            <a href="#how-it-works" className="hover:text-[#1a73e8] transition-colors">How it works</a>
            <a href="#integrations" className="hover:text-[#1a73e8] transition-colors">Integrations</a>
            <a href="#case-study" className="hover:text-[#1a73e8] transition-colors">Case Study</a>
          </div>

          <div className="text-slate-400">
            © 2026 GWCC. Engineered for Google Workspace.
          </div>
        </div>
      </footer>
    </div>
  );
};
