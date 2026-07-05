import { useUIStore } from './ui';

export { useAuthStore } from '@/features/auth';
export { useUIStore } from './ui';

export const useSidebarStore = () => {
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  return {
    isCollapsed: sidebarCollapsed,
    toggleSidebar,
  };
};

export const useThemeStore = () => {
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);
  return {
    theme,
    setTheme,
  };
};
