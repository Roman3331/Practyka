import { create } from 'zustand';

interface ConfirmOptions {
  title?: string;
  message: string;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary' | 'info';
  isAlert?: boolean;
}

interface ConfirmState {
  isOpen: boolean;
  options: ConfirmOptions | null;
  confirm: (options: ConfirmOptions) => void;
  alert: (options: Omit<ConfirmOptions, 'onConfirm'>) => void;
  close: () => void;
}

export const useConfirmStore = create<ConfirmState>((set) => ({
  isOpen: false,
  options: null,
  confirm: (options) => set({ isOpen: true, options: { ...options, isAlert: false } }),
  alert: (options) => set({ isOpen: true, options: { ...options, isAlert: true } }),
  close: () => set({ isOpen: false, options: null }),
}));
