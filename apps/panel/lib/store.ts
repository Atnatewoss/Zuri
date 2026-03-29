import { create } from 'zustand'

export interface SettingsState {
  resortName: string;
  description: string;
  location: string;
  email: string;
  allowedDomains: string;
  avatarClothing: string;
  avatarColor: string;
  avatarSkinTone: string;
  isLoaded: boolean;
  setSettings: (data: Partial<SettingsState>) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  resortName: '',
  description: '',
  location: '',
  email: '',
  allowedDomains: '',
  avatarClothing: 'Suit',
  avatarColor: '#1a1a1a',
  avatarSkinTone: 'Neutral',
  isLoaded: false,
  setSettings: (data) => set((state) => ({ ...state, ...data })),
}))
