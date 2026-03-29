import { create } from 'zustand'

export interface SettingsState {
  resortName: string;
  description: string;
  location: string;
  email: string;
  allowedDomains: string;
  isLoaded: boolean;
  setSettings: (data: Partial<SettingsState>) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  resortName: '',
  description: '',
  location: '',
  email: '',
  allowedDomains: '',
  isLoaded: false,
  setSettings: (data) => set((state) => ({ ...state, ...data })),
}))
