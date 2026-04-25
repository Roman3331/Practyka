import { create } from 'zustand';

interface SidebarState {
  isOpen: boolean;
  isCollapsed: boolean;
  toggleSidebar: () => void;
  setIsOpen: (isOpen: boolean) => void;
  toggleCollapsed: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: false,
  isCollapsed: false,
  toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })),
  setIsOpen: (isOpen) => set({ isOpen }),
  toggleCollapsed: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
}));
