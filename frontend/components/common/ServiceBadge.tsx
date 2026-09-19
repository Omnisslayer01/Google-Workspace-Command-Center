import React from 'react';

interface ServiceBadgeProps {
  service: 'gmail' | 'calendar' | 'drive' | 'sheets';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ServiceBadge: React.FC<ServiceBadgeProps> = ({
  service,
  showLabel = true,
  size = 'md',
  className = '',
}) => {
  const configs = {
    gmail: {
      label: 'Gmail',
      color: '#ea4335',
      badgeBg: 'bg-red-50 text-red-900 border-red-200',
      icon: (
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
    },
    calendar: {
      label: 'Calendar',
      color: '#1a73e8',
      badgeBg: 'bg-blue-50 text-blue-900 border-blue-200',
      icon: (
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    drive: {
      label: 'Drive',
      color: '#0f9d58',
      badgeBg: 'bg-emerald-50 text-emerald-900 border-emerald-200',
      icon: (
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    sheets: {
      label: 'Sheets',
      color: '#f9ab00',
      badgeBg: 'bg-amber-50 text-amber-900 border-amber-200',
      icon: (
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3h18v18H3z" />
          <path d="M3 9h18M3 15h18M9 3v18" />
        </svg>
      ),
    },
  };

  const item = configs[service];
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2',
    lg: 'text-sm px-3 py-1.5 gap-2.5',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <span
      className={`inline-flex items-center font-medium border rounded ${sizeClasses[size]} ${item.badgeBg} ${className}`}
    >
      <span className={`${iconSizes[size]} shrink-0`} style={{ color: item.color }}>
        {item.icon}
      </span>
      {showLabel && <span>{item.label}</span>}
    </span>
  );
};