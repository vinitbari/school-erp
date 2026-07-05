import { create } from 'zustand';

interface UIStore {
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  academicYear: string;
  toggleSidebar: () => void;
  setSidebarMobileOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setAcademicYear: (year: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarCollapsed: false,
  sidebarMobileOpen: false,
  theme: (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'light',
  academicYear: 'Apr 26 - Mar 27',

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarMobileOpen: (open) => set({ sidebarMobileOpen: open }),

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    const root = document.documentElement;
    if (theme === 'system') {
      const sys = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', sys);
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
    set({ theme });
  },

  setAcademicYear: (year) => set({ academicYear: year }),
}));
