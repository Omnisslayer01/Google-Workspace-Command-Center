import React, { useState, useCallback, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  CheckSquare,
  Table,
  LayoutDashboard,
  Mail,
  Menu,
  X,
  HardDrive,
  Zap,
  History,
  LogOut,
  User,
  ChevronDown,
  Bell,
} from 'lucide-react';

interface HeaderProps {}

export const Header: React.FC<HeaderProps> = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close the profile menu when clicking outside.
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setShowProfileMenu(false);
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

  // Notifications intentionally stays out of the navigation list.
  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/gmail',
      label: 'Gmail',
      icon: Mail,
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
      to: '/automations',
      label: 'Automation',
      icon: Zap,
    },
    {
      to: '/automations/history',
      label: 'History',
      icon: History,
    },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      {/* Google four-color accent stripe */}
      <div className="grid h-1 w-full grid-cols-4">
        <span className="bg-[#4285F4]" title="Calendar Blue" />
        <span className="bg-[#EA4335]" title="Gmail Red" />
        <span className="bg-[#FBBC04]" title="Drive Yellow" />
        <span className="bg-[#34A853]" title="Sheets Green" />
      </div>

      <div className="mx-auto flex min-h-16 w-full max-w-none items-center justify-between gap-2 px-3">
        {/* Brand */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Link
            to="/dashboard"
            className="group flex shrink-0 items-center gap-1.5"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white p-1.5 shadow-2xs transition-colors group-hover:border-slate-300">
              <div className="grid h-full w-full grid-cols-2 gap-1">
                <span className="rounded-[2px] bg-[#4285F4]" title="Calendar" />
                <span className="rounded-[2px] bg-[#EA4335]" title="Gmail" />
                <span className="rounded-[2px] bg-[#FBBC04]" title="Drive" />
                <span className="rounded-[2px] bg-[#34A853]" title="Sheets" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-slate-900">
                  GWCC
                </span>
                <span className="hidden rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 sm:inline-block">
                  Command Center
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop navigation — no Notifications tab */}
          <nav
            className="hidden min-w-0 flex-1 items-center justify-start gap-0 overflow-x-auto min-[768px]:flex"
            style={{ scrollbarWidth: 'none' }}
          >
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/dashboard'}
                  className={({ isActive }) =>
                    `flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-1.5 py-2 text-[13px] font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-100 font-semibold text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Right-side actions */}
        <div className="flex shrink-0 items-center gap-1">
          {/* Bell icon — opens the Notifications page without a text tab or dropdown */}
          <button
            type="button"
            onClick={() => navigate('/notifications')}
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="View notifications"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>

          {/* User account and profile menu */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setShowProfileMenu((prev) => !prev)}
              className="flex shrink-0 items-center gap-1.5 rounded-lg px-1.5 py-1 transition-colors hover:bg-slate-50"
              aria-label="Open profile menu"
            >
              <div className="relative">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white shadow-2xs">
                  <User className="h-4 w-4" />
                </div>

                {accessToken && (
                  <span
                    className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#34A853]"
                    title="Authenticated"
                  />
                )}
              </div>

              <div className="hidden min-w-0 text-left min-[768px]:block">
                <div className="whitespace-nowrap text-[10px] text-slate-500">
                  {accessToken ? 'Workspace User' : 'Not signed in'}
                </div>
                <div className="truncate text-[10px] text-slate-500">
                  {accessToken ? 'Google Connected' : 'Please sign in'}
                </div>
              </div>

              <ChevronDown className="hidden h-3 w-3 text-slate-400 sm:block" />
            </button>

            {/* Profile dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-lg">
                <div className="p-2">
                  {accessToken ? (
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  ) : (
                    <Link
                      to="/"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <User className="h-4 w-4" />
                      <span>Sign In</span>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((previous) => !previous)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile navigation — no Notifications tab */}
      {mobileMenuOpen && (
        <div className="space-y-1 border-t border-slate-200 bg-white px-4 py-3 shadow-md md:hidden">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={`mobile-${item.to}`}
                to={item.to}
                end={item.to === '/dashboard'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive
                      ? 'bg-slate-100 font-semibold text-slate-900'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="h-4 w-4 text-slate-500" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          {/* Mobile logout */}
          {accessToken && (
            <div className="border-t border-slate-100 pt-2">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};