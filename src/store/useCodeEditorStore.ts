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
    granularity: 'Daily' | 'Hourly';
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

    backtestUniverse: string[];
    setBacktestUniverse: (ids: string[]) => void;

    backtestSettings: BacktestSettings;
    setBacktestSettings: (s: Partial<BacktestSettings>) => void;

    runBacktest: () => Promise<void>;
}

const DEFAULT_CODE = `class MyStrategy(Strategy):
    # on_start runs ONCE, right before the backtest begins.
    # Use it to set up any variables your strategy needs to remember
    # between bars (days) — kind of like a constructor.
    def on_start(self):
        self.symbol = "AAPL"  # the instrument this strategy trades

    # on_bar runs ONCE PER DAY, for every day in the backtest period.
    # "bar" is a dict of that day's price data for every instrument
    # currently loaded, e.g.:
    # { "AAPL": {"open": .., "high": .., "low": .., "close": .., "volume": ..}, ... }
    def on_bar(self, date, bar):
        # Not every symbol has data on every day — always check first,
        # otherwise bar[self.symbol] could throw a KeyError.
        if self.symbol not in bar:
            return

        # Grab today's closing price for our symbol.
        price = bar[self.symbol]["close"]

        # self.positions is a dict of symbol -> how many shares you currently hold.
        # .get(self.symbol, 0) returns 0 if you don't hold any yet.
        position = self.positions.get(self.symbol, 0)

        if position == 0:
            # We don't own any shares yet — buy some.
            # self.cash is how much money you have available right now.
            # Here we spend 10% of our cash on this trade.
            size = int((self.cash * 0.10) / price)  # how many whole shares that buys

            if size > 0:
                self.buy(self.symbol, size)  # places the buy order
        else:
            # We already own shares — sell everything we're holding.
            # This just demonstrates sell() working; a real strategy
            # would only sell based on some condition, not every time.
            self.sell(self.symbol, position)
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

    // store selected instruments (the "universe" the user picked to test against)
    backtestUniverse: ['AAPL', 'NVDA'],
    setBacktestUniverse: (universe) => set({ backtestUniverse: universe }),

    // store settings
    backtestSettings: {
        startingCapital: 100000,
        commissionPerTrade: 0,
        slippagePercentage: 0,
        startDate: '2021-01-01',
        endDate: '2026-01-01',
        granularity: 'Daily'
    },
    setBacktestSettings: (s: Partial<BacktestSettings>) => set((state) => ({ backtestSettings: { ...state.backtestSettings, ...s } })),

    runBacktest: async () => {
        const instrumentIds = get().backtestUniverse;

        if (instrumentIds.length === 0) {
            get().addBacktestLog('Select at least one instrument before running.', 'error');
            return;
        }

        set({ backtestStatus: 'loading', backtestResult: null, backtestError: null });

        try {
            // load historical data for the selected instruments (stocks)
            const data = await loadInstrumentData(instrumentIds);

            set({ backtestStatus: 'running' });

            const backtestWorker = getWorker();

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

            backtestWorker.postMessage({ code: get().code, settings: get().backtestSettings, data: data });
        } catch (err: any) {
            get().addBacktestLog(err.message ?? 'Failed to load data', 'error');
            set({ backtestStatus: 'error', backtestResult: null, backtestError: err.message });
        }
    },
}));

export { useCodeEditorStore };