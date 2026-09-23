import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  CalendarDays,
  CheckSquare,
  Table,
  LayoutDashboard,
  Bell,
  Menu,
  X,
  Layers,
  HardDrive,
} from 'lucide-react';
import { MOCK_NOTIFICATIONS } from '../../data/mockData';

interface HeaderProps {
  onOpenNotifications?: () => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNotifications,
  unreadCount = 2,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/drive', label: 'Drive', icon: HardDrive },
  { to: '/sheets', label: 'Sheets', icon: Table },
];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      {/* Top Google 4-color accent hairline stripe */}
      <div className="grid grid-cols-4 h-1 w-full">
        <span className="bg-[#4285F4]" title="Calendar Blue"></span>
        <span className="bg-[#EA4335]" title="Gmail Red"></span>
        <span className="bg-[#FBBC04]" title="Drive Yellow"></span>
        <span className="bg-[#34A853]" title="Sheets Green"></span>
      </div>

      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-1.5 shadow-2xs group-hover:border-slate-300 transition-colors">
              <div className="grid grid-cols-2 gap-1 w-full h-full">
                <span className="bg-[#4285F4] rounded-[2px]" title="Calendar"></span>
                <span className="bg-[#EA4335] rounded-[2px]" title="Gmail"></span>
                <span className="bg-[#FBBC04] rounded-[2px]" title="Drive"></span>
                <span className="bg-[#34A853] rounded-[2px]" title="Sheets"></span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-slate-900">GWCC</span>
                <span className="hidden sm:inline-block text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  Command Center
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-slate-100 text-slate-900 font-semibold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Subtle Concept review index button */}
          {/* Notifications button & dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                if (onOpenNotifications) {
                  onOpenNotifications();
                } else {
                  setShowNotificationsDropdown(!showNotificationsDropdown);
                }
              }}
              className="relative rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EA4335] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#EA4335]"></span>
                </span>
              )}
            </button>

            {/* In-header Notification Dropdown (fallback if drawer not passed) */}
            {showNotificationsDropdown && !onOpenNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white p-3 shadow-lg z-50 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2 px-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Workspace Alerts</span>
                  <span className="text-[11px] font-medium text-[#4285F4]">{MOCK_NOTIFICATIONS.length} events</span>
                </div>
                <div className="space-y-1.5 max-h-72 overflow-y-auto">
                  {MOCK_NOTIFICATIONS.map((notif) => (
                    <div
                      key={notif.id}
                      className="p-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">{notif.title}</span>
                        <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                      </div>
                      <p className="text-slate-500 mt-1 line-clamp-2">{notif.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Account / Organization status */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="relative">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white shadow-2xs">
                Y
              </div>
              <span
                className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#34A853] border-2 border-white"
                title="Google Workspace Connected"
              />
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-900">Yash</div>
              <div className="text-[10px] text-slate-500">Google Workspace Admin</div>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 shadow-md">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-4 h-4 text-slate-500" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
          <div className="pt-2 border-t border-slate-100">
            <Link
              to="/concepts"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 rounded-lg"
            >
              <Layers className="w-4 h-4 text-slate-400" />
              <span>Review Design Concepts 1–5</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
