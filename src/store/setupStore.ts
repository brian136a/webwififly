import { create } from 'zustand';
import type { RoomTestResult } from '@/types/librespeed';

export type SetupState = {
  isp: string;
  downloadSpeed: number | null;
  cost: number | null;
  modemRoom: string;
  additionalRooms: string[];
  testResults: RoomTestResult[];

  // actions
  setIsp: (isp: string) => void;
  setDownloadSpeed: (mbps: number | null) => void;
  setCost: (nz$PerMonth: number | null) => void;
  setModemRoom: (room: string) => void;
  addAdditionalRoom: (room: string) => void;
  removeAdditionalRoom: (room: string) => void;
  addTestResult: (result: RoomTestResult) => void;
  clearTestResults: () => void;
  reset: () => void;
};

const initialState = {
  isp: '',
  downloadSpeed: null,
  cost: null,
  modemRoom: '',
  additionalRooms: [],
  testResults: [],
};

export const useSetupStore = create<SetupState>((set) => ({
  ...initialState,
  setIsp: (isp) => set({ isp }),
  setDownloadSpeed: (mbps) => set({ downloadSpeed: mbps }),
  setCost: (cost) => set({ cost }),
  setModemRoom: (modemRoom) => set({ modemRoom }),
  addAdditionalRoom: (room) =>
    set((state) => ({ additionalRooms: [...state.additionalRooms, room] })),
  removeAdditionalRoom: (room) =>
    set((state) => ({ additionalRooms: state.additionalRooms.filter((r) => r !== room) })),
  addTestResult: (result) =>
    set((state) => ({ testResults: [...state.testResults, result] })),
  clearTestResults: () => set({ testResults: [] }),
  reset: () => set(initialState),
}));
