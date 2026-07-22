// src/store/useCodeEditorStore.ts
import { create } from 'zustand';
import type { BacktestResult } from '../types';

type BacktestStatus = 'idle' | 'loading' | 'running' | 'success' | 'error';

interface CodeEditorState {
  code: string;
  setCode: (v: string) => void;

  backtestStatus: BacktestStatus;
  backtestResult: BacktestResult | null;
  backtestError: string | null;
  setBacktestState: (
    status: BacktestStatus,
    result?: BacktestResult | null,
    error?: string | null
  ) => void;
}

const DEFAULT_CODE = `class MyStrategy(Strategy):
    def on_start(self):
        pass

    def on_bar(self, date, bar):
        pass
`;

const useCodeEditorStore = create<CodeEditorState>((set) => ({
  code: DEFAULT_CODE,
  setCode: (code) => set({ code }),

  backtestStatus: 'idle',
  backtestResult: null,
  backtestError: null,
  setBacktestState: (status, result = null, error = null) =>
    set({ backtestStatus: status, backtestResult: result, backtestError: error }),
}));

export { useCodeEditorStore };