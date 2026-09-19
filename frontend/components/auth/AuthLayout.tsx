import type { ReactNode } from "react";
import Link from "next/link";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-google-surface px-4 py-12">
      
      {/* Back to Home Link */}
      <div className="absolute top-8 left-8">
        <Link href="/" className="text-sm font-medium text-google-gray hover:text-google-blue transition-colors">
          &larr; Back to Home
        </Link>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-[440px] bg-white border border-google-border rounded-xl shadow-sm px-8 py-10 sm:px-10">
        
        {/* Concept 5 Branding (4-color grid + Wordmark) */}
        <div className="mb-8 flex flex-col items-start gap-3">
          <div className="grid grid-cols-2 gap-0.5 w-6 h-6">
            <span className="bg-google-red rounded-sm"></span>
            <span className="bg-google-blue rounded-sm"></span>
            <span className="bg-google-green rounded-sm"></span>
            <span className="bg-google-yellow rounded-sm"></span>
          </div>
          <div>
            <span className="text-[11px] font-bold tracking-widest uppercase text-google-gray select-none">
              Google Workspace
            </span>
            <h1 className="text-xl font-bold tracking-tight text-google-dark">
              Command Center
            </h1>
          </div>
        </div>

        {/* Page title */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-google-dark">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-sm text-google-gray">{subtitle}</p>
          )}
        </div>

        {/* Form content (The Google SSO Button) */}
        {children}

      </div>
      
      {/* Footer note */}
      <p className="mt-8 text-xs text-google-gray text-center">
        &copy; {new Date().getFullYear()} Google Workspace Command Center
      </p>
    </div>
  );
}