import { create } from 'zustand'

interface SidebarState {
  isOpen: boolean
  toggle: () => void
  setOpen: (isOpen: boolean) => void
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: true, // Default to open, will be overwritten by a client-side check if needed
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (isOpen) => set({ isOpen }),
}))
