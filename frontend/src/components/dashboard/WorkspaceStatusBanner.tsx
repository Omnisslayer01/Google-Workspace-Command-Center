import React from 'react';
import { Mail, Calendar, HardDrive, Table, AlertTriangle } from 'lucide-react';
import { MOCK_SERVICES_STATUS } from '../../data/mockData';
import { ServiceStatusInfo } from '../../types';

interface WorkspaceStatusBannerProps {
  services?: ServiceStatusInfo[];
  authError?: string | null;
  dataSource?: 'live' | 'mock' | 'adapter';
}

export const WorkspaceStatusBanner: React.FC<WorkspaceStatusBannerProps> = ({
  services = MOCK_SERVICES_STATUS,
  authError,
  dataSource = 'live',
}) => {
  const serviceConfigs = {
    gmail: {
      name: 'Gmail',
      color: '#EA4335',
      badgeBg: 'bg-red-50 text-[#c5221f] border-red-200',
      icon: <Mail className="w-4 h-4 text-[#EA4335]" />,
    },
    calendar: {
      name: 'Calendar',
      color: '#4285F4',
      badgeBg: 'bg-blue-50 text-[#1a73e8] border-blue-200',
      icon: <Calendar className="w-4 h-4 text-[#4285F4]" />,
    },
    drive: {
      name: 'Drive',
      color: '#FBBC04',
      badgeBg: 'bg-amber-50 text-[#b45309] border-amber-200',
      icon: <HardDrive className="w-4 h-4 text-[#b45309]" />,
    },
    sheets: {
      name: 'Sheets',
      color: '#34A853',
      badgeBg: 'bg-emerald-50 text-[#0f9d58] border-emerald-200',
      icon: <Table className="w-4 h-4 text-[#34A853]" />,
    },
  };

  return (
    <div className="space-y-3">
      {/* Top micro status indicator */}
      <div className="flex items-center justify-between text-xs px-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Connected Services</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500 font-mono text-[11px]">Least-privilege OAuth grants active</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-mono text-[11px] text-slate-600">
            {dataSource === 'live' ? 'Backend Live API' : 'Local Adapter Active'}
          </span>
        </div>
      </div>

      {/* Auth / Connection Warning Notice if auth failed */}
      {authError && (
        <div className="rounded-xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-red-900">Google Workspace Authorization Required</h4>
            <p className="mt-0.5 text-xs text-red-700 leading-relaxed">{authError}</p>
            <p className="mt-1 text-[11px] text-red-600">
              Authenticate via the BE1 Google OAuth service to enable live bi-directional synchronization.
            </p>
          </div>
        </div>
      )}

      {/* Main Services Status Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {services.map((service) => {
          const cfg = serviceConfigs[service.id];
          return (
            <div
              key={service.id}
              className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs hover:border-slate-300 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center border"
                  style={{
                    backgroundColor: `${cfg.color}10`,
                    borderColor: `${cfg.color}30`,
                  }}
                >
                  {cfg.icon}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-slate-900">{cfg.name}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#34A853]" />
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Sync: {service.lastSync}
                  </div>
                </div>
              </div>

              <span
                className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${cfg.badgeBg}`}
              >
                {service.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
