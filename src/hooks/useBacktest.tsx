import { useEffect, useRef, useState, useCallback } from 'react';
import { loadInstrumentData } from '../lib/loadData';
import type { BacktestResult } from '../types';

type BacktestState =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'running' }
    | { status: 'success'; result: BacktestResult }
    | { status: 'error'; error: string };

function useBacktest() {
    const workerRef = useRef<Worker | null>(null);
    const [state, setState] = useState<BacktestState>({ status: 'idle' });

    useEffect(() => {
        workerRef.current = new Worker(
            new URL('../workers/backtest.worker.ts', import.meta.url),
            { type: 'module' }
        );

        workerRef.current.onmessage = (event: MessageEvent) => {
            if (event.data.success) {
                setState({ status: 'success', result: event.data.result });
            } else {
                setState({ status: 'error', error: event.data.error });
            }
        };

        return () => workerRef.current?.terminate();
    }, []);

    const run = useCallback(async (code: string, instrumentIds: string[]) => {
        setState({ status: 'loading' });

        try {
            const data = await loadInstrumentData(instrumentIds);
            setState({ status: 'running' });
            workerRef.current?.postMessage({ code, data });
        } catch (err: any) {
            setState({ status: 'error', error: err.message });
        }
    }, []);

    return { state, run };
}

export { useBacktest };