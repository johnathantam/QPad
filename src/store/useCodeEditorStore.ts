// src/store/useCodeEditorStore.ts
import { create } from 'zustand';
import type { BacktestResult } from '../types';
import { loadInstrumentData } from '../lib/loadData';

interface LogEntry {
    id: string;
    message: string;
    level: 'info' | 'success' | 'error' | 'warn';
    timestamp: string;
}

type BacktestStatus =
    'idle' |
    'loading' |
    'running' |
    'success' |
    'error';

interface BacktestSettings {
    startingCapital: number;
    commissionPerTrade: number;
    slippagePercentage: number;
    startDate: string;
    endDate: string;
}

interface CodeEditorState {
    code: string;
    setCode: (v: string) => void;

    backtestLogs: LogEntry[];
    addBacktestLog: (message: string, level?: LogEntry['level']) => void;
    clearBacktestLogs: () => void;

    backtestStatus: BacktestStatus;
    backtestResult: BacktestResult | null;
    backtestError: string | null;
    setBacktestState: (
        status: BacktestStatus,
        result?: BacktestResult | null,
        error?: string | null
    ) => void;

    backtestSettings: BacktestSettings;
    setBacktestSettings: (s: Partial<BacktestSettings>) => void;

    runBacktest: (instrumentIds: string[]) => Promise<void>;
}

const DEFAULT_CODE = `class MyStrategy(Strategy):
    def on_start(self):
        pass

    def on_bar(self, date, bar):
        pass
`;

// module-level singleton — created once, shared by everyone
let worker: Worker | null = null;
function getWorker() {
    if (!worker) {
        worker = new Worker(
            new URL('../workers/backtest.worker.ts', import.meta.url),
            { type: 'module' }
        );
    }
    return worker;
}

const useCodeEditorStore = create<CodeEditorState>((set, get) => ({
    // store code
    code: DEFAULT_CODE,
    setCode: (code) => set({ code }),

    // store logs
    backtestLogs: [],
    addBacktestLog: (message, level = 'info') =>
        set((s) => ({ backtestLogs: [...s.backtestLogs, { id: crypto.randomUUID(), message, level, timestamp: new Date().toLocaleTimeString([], { hour12: false }) }] })),
    clearBacktestLogs: () => set({ backtestLogs: [] }),

    // store backtest state
    backtestStatus: 'idle',
    backtestResult: null,
    backtestError: null,
    setBacktestState: (status, result = null, error = null) =>
        set({ backtestStatus: status, backtestResult: result, backtestError: error }),

    // store settings
    backtestSettings: {
        startingCapital: 100000,
        commissionPerTrade: 0,
        slippagePercentage: 0,
        startDate: '2021-01-01',
        endDate: '2026-01-01',
    },
    setBacktestSettings: (s: Partial<BacktestSettings>) => set((state) => ({ backtestSettings: { ...state.backtestSettings, ...s } })), 

    runBacktest: async (instrumentIds) => {
        set({ backtestStatus: 'loading', backtestResult: null, backtestError: null });
        try {
            // load historical data for instruments (stocks)
            const data = await loadInstrumentData(instrumentIds);

            // update status
            set({ backtestStatus: 'running' });

            const backtestWorker = getWorker();

            // track backtest messages during run - adjust state
            backtestWorker.onmessage = (event: MessageEvent) => {
                const { type } = event.data;

                if (type === 'log') {
                    get().addBacktestLog(event.data.message, event.data.level);
                    return;
                }

                if (type === 'result') {
                    if (event.data.success) {
                        get().addBacktestLog('Backtest completed successfully.', 'success');
                        set({ backtestStatus: 'success', backtestResult: event.data.result, backtestError: null });
                    } else {
                        get().addBacktestLog(event.data.error ?? 'Unknown error', 'error');
                        set({ backtestStatus: 'error', backtestResult: null, backtestError: event.data.error });
                    }
                }
            };

            // pass code and data into the worker for it to run
            backtestWorker.postMessage({ code: get().code, backtestSettings: get().backtestSettings ,data: data });
        } catch (err: any) {
            get().addBacktestLog(err.message ?? 'Failed to load data', 'error');
            set({ backtestStatus: 'error', backtestResult: null, backtestError: err.message });
        }
    },
}));

export { useCodeEditorStore };