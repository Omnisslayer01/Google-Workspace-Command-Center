/**
 * AuthLayout — shared shell for all authentication pages (Login, Register).
 *
 * Layout:
 *   - Full-height page with the brand background (#F8F7F2).
 *   - Centred card containing the GWCC wordmark, a page title/subtitle, and
 *     the form content passed as children.
 *   - Responsive: full-screen on mobile, constrained card on tablet+.
 */

import type { ReactNode } from "react";

interface AuthLayoutProps {
  /** Page-level heading, e.g. "Sign in" */
  title: string;
  /** Optional sub-heading, e.g. "Welcome back" */
  subtitle?: string;
  children: ReactNode;
}

export default function AuthLayout({
  title,
  subtitle,
  children,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F8F7F2] px-4 py-12">
      {/* Card */}
      <div className="w-full max-w-[440px] bg-white border border-stone-200 rounded-2xl shadow-sm px-8 py-10 sm:px-10">
        {/* Wordmark */}
        <div className="mb-8">
          <span className="text-[13px] font-semibold tracking-[0.18em] uppercase text-stone-400 select-none">
            Google Workspace
          </span>
          <h1 className="mt-0.5 text-[22px] font-bold tracking-tight text-stone-900 leading-snug">
            Command Center
          </h1>
        </div>

        {/* Page title */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-stone-900">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-sm text-stone-500">{subtitle}</p>
          )}
        </div>

        {/* Form content */}
        {children}
      </div>

      {/* Footer note */}
      <p className="mt-6 text-xs text-stone-400 text-center">
        &copy; {new Date().getFullYear()} Google Workspace Command Center
      </p>
    </div>
  );
}
