import { useAuthStore, useUIStore } from '@/store';
import { getInitials } from '@/lib/utils';
import {
  Menu,
  Sun,
  Moon,
  Monitor,
  LogOut,
  Bell,
  Search,
  User,
  Settings,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  const { user, logout } = useAuthStore();
  const { toggleSidebar, setSidebarMobileOpen, theme, setTheme, academicYear } = useUIStore();
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;
  const cycleTheme = () => {
    const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
    const idx = themes.indexOf(theme);
    setTheme(themes[(idx + 1) % themes.length]);
  };

  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-4 gap-4">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => { toggleSidebar(); setSidebarMobileOpen(true); }}
          className="p-2 rounded-lg hover:bg-accent transition-colors"
        >
          <Menu className="h-5 w-5 text-muted-foreground" />
        </button>

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-1.5 w-64 border border-transparent focus-within:border-primary/30 transition-colors">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search students, enquiries..."
            className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground/50"
          />
          <kbd className="hidden lg:flex h-5 items-center gap-1 rounded border bg-background px-1.5 text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Academic Year */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold cursor-pointer hover:bg-primary/15 transition-colors">
          <Calendar className="h-3.5 w-3.5" />
          <span>{academicYear}</span>
          <ChevronDown className="h-3 w-3" />
        </div>

        {/* Theme */}
        <button
          onClick={cycleTheme}
          className="p-2 rounded-lg hover:bg-accent transition-colors"
          title={`Theme: ${theme}`}
        >
          <ThemeIcon className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Notifications */}
        <button className="p-2 rounded-lg hover:bg-accent transition-colors relative">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
        </button>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 ml-1 pl-3 border-l border-border hover:bg-accent rounded-lg py-1 pr-2 transition-colors"
          >
            <div className="h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center">
              <span className="text-[11px] font-bold text-primary">
                {user ? getInitials(`${user.firstName} ${user.lastName}`) : 'U'}
              </span>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-medium leading-none">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {user?.role?.replace(/_/g, ' ')}
              </p>
            </div>
            <ChevronDown className="h-3 w-3 text-muted-foreground hidden md:block" />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-popover border border-border rounded-xl shadow-xl z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-3 py-2 border-b border-border mb-1">
                <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
                {user?.customerId && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Customer ID: {user.customerId}
                  </p>
                )}
              </div>
              <Link
                to="/profile"
                onClick={() => setShowProfile(false)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent transition-colors"
              >
                <User className="h-3.5 w-3.5" />
                View Profile
              </Link>
              <Link
                to="/manage-users"
                onClick={() => setShowProfile(false)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent transition-colors"
              >
                <Settings className="h-3.5 w-3.5" />
                Manage Users
              </Link>
              <div className="border-t border-border mt-1 pt-1">
                <button
                  onClick={() => { setShowProfile(false); logout(); }}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm w-full text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
