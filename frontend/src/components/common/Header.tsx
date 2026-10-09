import React, { useState, useCallback, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  CheckSquare,
  Table,
  LayoutDashboard,
  Bell,
  Menu,
  X,
  HardDrive,
  Zap,
  History,
  Activity,
  LogOut,
  User,
  ChevronDown,
} from 'lucide-react';

interface HeaderProps {
  onOpenNotifications?: () => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNotifications,
  unreadCount = 0,
}) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] =
    useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotificationsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setShowProfileMenu(false);
    navigate('/', { replace: true });
  }, [navigate]);

  const accessToken = localStorage.getItem('access_token');

  // Keep each navigation item only ONCE.
  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/calendar',
      label: 'Calendar',
      icon: CalendarDays,
    },
    {
      to: '/tasks',
      label: 'Tasks',
      icon: CheckSquare,
    },
    {
      to: '/drive',
      label: 'Drive',
      icon: HardDrive,
    },
    {
      to: '/sheets',
      label: 'Sheets',
      icon: Table,
    },
    {
      to: '/automations/new',
      label: 'Automation',
      icon: Zap,
    },
    {
      to: '/automations/history',
      label: 'History',
      icon: History,
    },
    {
      to: '/audit',
      label: 'Audit Log',
      icon: Activity,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      {/* Google 4-color accent stripe */}
      <div className="grid grid-cols-4 h-1 w-full">
        <span
          className="bg-[#4285F4]"
          title="Calendar Blue"
        />
        <span
          className="bg-[#EA4335]"
          title="Gmail Red"
        />
        <span
          className="bg-[#FBBC04]"
          title="Drive Yellow"
        />
        <span
          className="bg-[#34A853]"
          title="Sheets Green"
        />
      </div>

      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-6">
        {/* Brand - links to Dashboard, not landing page */}
        <div className="flex items-center gap-6">
          <Link
            to="/dashboard"
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-1.5 shadow-2xs group-hover:border-slate-300 transition-colors">
              <div className="grid grid-cols-2 gap-1 w-full h-full">
                <span
                  className="bg-[#4285F4] rounded-[2px]"
                  title="Calendar"
                />
                <span
                  className="bg-[#EA4335] rounded-[2px]"
                  title="Gmail"
                />
                <span
                  className="bg-[#FBBC04] rounded-[2px]"
                  title="Drive"
                />
                <span
                  className="bg-[#34A853] rounded-[2px]"
                  title="Sheets"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-slate-900">
                  GWCC
                </span>

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
                  end={item.to === '/dashboard'}
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
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => {
                if (onOpenNotifications) {
                  onOpenNotifications();
                } else {
                  setShowNotificationsDropdown(
                    (previous) => !previous
                  );
                }
              }}
              className="relative rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />

              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EA4335] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#EA4335]" />
                </span>
              )}
            </button>

            {/* Notification dropdown */}
            {showNotificationsDropdown &&
              !onOpenNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white p-3 shadow-lg z-50 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2 px-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Workspace Alerts
                    </span>

                    <span className="text-[11px] font-medium text-slate-400">
                      No new notifications
                    </span>
                  </div>

                  <div className="py-8 text-center text-sm text-slate-400">
                    No notifications yet.
                  </div>
                </div>
              )}
          </div>

          {/* User Account with Profile Menu */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setShowProfileMenu((prev) => !prev)}
              className="flex items-center gap-2 pl-2 border-l border-slate-200 hover:bg-slate-50 rounded-lg px-2 py-1 transition-colors"
            >
              <div className="relative">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white shadow-2xs">
                  <User className="w-4 h-4" />
                </div>

                {accessToken && (
                  <span
                    className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#34A853] border-2 border-white"
                    title="Authenticated"
                  />
                )}
              </div>

              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-slate-900">
                  {accessToken ? 'Workspace User' : 'Not signed in'}
                </div>

                <div className="text-[10px] text-slate-500">
                  {accessToken ? 'Google Connected' : 'Please sign in'}
                </div>
              </div>

              <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
            </button>

            {/* Profile dropdown menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-lg z-50">
                <div className="p-2">
                  {accessToken ? (
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  ) : (
                    <Link
                      to="/"
                      onClick={() => setShowProfileMenu(false)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors font-medium"
                    >
                      <User className="w-4 h-4" />
                      <span>Sign In</span>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen((previous) => !previous)
            }
            className="md:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 shadow-md">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={`mobile-${item.to}`}
                to={item.to}
                end={item.to === '/dashboard'}
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

          {/* Mobile logout */}
          {accessToken && (
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg w-full"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};