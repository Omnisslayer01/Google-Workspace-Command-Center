"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Layout, Database, Workflow } from "lucide-react";
import { WORKSPACE_SERVICES, CORE_PILLARS } from "@/data/mockWorkspaceData";
import { ServiceBadge } from "@/components/common/ServiceBadge";

function Concept5LandingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessingToken, setIsProcessingToken] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ─── AUTHENTICATION LOGIC ──────────────────────────────────────────────
  useEffect(() => {
    const access = searchParams.get("access");
    const refresh = searchParams.get("refresh");

    if (access && refresh) {
      setIsProcessingToken(true);
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      setIsLoggedIn(true);
      router.replace("/");
      setIsProcessingToken(false);
    } else {
      const token = localStorage.getItem("access_token");
      if (token) setIsLoggedIn(true);
    }
  }, [router, searchParams]);

  if (isProcessingToken) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-google-blue border-r-transparent"></div>
        <p className="text-google-gray font-medium">Authenticating your Google Workspace...</p>
      </div>
    );
  }

  // ─── CONCEPT 5 UI (Workspace Inspired) ─────────────────────────────────
  return (
    <div className="min-h-screen bg-white text-google-dark font-sans selection:bg-google-blue selection:text-white pb-24">
      
      {/* HEADER */}
      <header className="border-b border-google-border bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="grid grid-cols-2 gap-0.5 w-5 h-5">
              <span className="bg-google-red rounded-sm"></span>
              <span className="bg-google-blue rounded-sm"></span>
              <span className="bg-google-green rounded-sm"></span>
              <span className="bg-google-yellow rounded-sm"></span>
            </div>
            <span className="text-lg font-bold tracking-tight text-google-dark">
              Command Center
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-5 text-sm">
            {isLoggedIn ? (
              <button
                onClick={() => {
                  localStorage.clear();
                  setIsLoggedIn(false);
                }}
                className="text-google-gray hover:text-google-dark font-medium transition-colors"
              >
                Sign Out
              </button>
            ) : (
              <Link href="/login" className="text-google-gray hover:text-google-dark font-medium transition-colors">
                Sign In
              </Link>
            )}

            <Link
              href={isLoggedIn ? "/dashboard" : "/login"}
              className="bg-google-blue text-white px-5 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium shadow-sm flex items-center gap-2"
            >
              {isLoggedIn ? "Open Workspace" : "Get Started"}
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="pt-24 pb-20 border-b border-google-border bg-google-surface">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-[11px] uppercase font-bold tracking-widest text-google-gray block mb-6">
            Google Workspace Ecosystem
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-google-dark leading-[1.1] tracking-tight mb-6">
            Your entire workspace.<br />One command center.
          </h1>
          <p className="text-lg text-google-gray max-w-2xl mx-auto mb-10 leading-relaxed">
            Bring Gmail, Calendar, Drive, and Sheets into a single, cohesive command environment. 
            Automate routine tasks with native API integrations and zero third-party scraping.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href={isLoggedIn ? "/dashboard" : "/login"}
              className="bg-google-blue text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2 shadow-sm"
            >
              <span>{isLoggedIn ? "Launch Dashboard" : "Connect Google Workspace"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* THREE PILLARS (Methodology) */}
      <section className="py-20 max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {CORE_PILLARS.map((pillar, idx) => {
            const icons = [<Layout key={1}/>, <Database key={2}/>, <Workflow key={3}/>];
            return (
              <div key={pillar.step} className="p-6 bg-white border border-google-border rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-full bg-google-surface flex items-center justify-center text-google-blue mb-5 border border-google-border">
                  {icons[idx]}
                </div>
                <h3 className="text-lg font-bold text-google-dark mb-2">{pillar.name}</h3>
                <p className="text-sm text-google-gray mb-5">{pillar.tagline}</p>
                <ul className="space-y-3">
                  {pillar.details.map((detail, i) => (
                    <li key={i} className="text-xs text-google-gray flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-google-green shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* SERVICES GRID */}
      <section className="py-20 bg-google-surface border-y border-google-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-google-dark mb-4">Native Google Integrations</h2>
            <p className="text-google-gray text-base">
              Secure OAuth 2.0 connectivity directly to your Workspace resources. No middleware, no delays.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {WORKSPACE_SERVICES.map((srv) => (
              <div key={srv.id} className="bg-white border border-google-border p-6 rounded-xl shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <ServiceBadge service={srv.id as any} size="lg" />
                    <span className="text-[10px] uppercase font-bold text-google-green bg-green-50 px-2 py-1 rounded border border-green-200">
                      {srv.status}
                    </span>
                  </div>
                  <p className="text-sm text-google-gray mb-6 leading-relaxed">
                    {srv.description}
                  </p>
                </div>
                
                <div className="border-t border-google-border pt-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-google-gray block mb-3">
                    Automated Actions
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {srv.actionsSupported.slice(0, 3).map((action, i) => (
                      <span key={i} className="text-[11px] bg-google-surface border border-google-border text-google-dark px-2 py-1 rounded">
                        {action}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

export default function RootPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <Concept5LandingPage />
    </Suspense>
  );
}