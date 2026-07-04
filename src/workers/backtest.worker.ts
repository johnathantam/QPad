// This file is the Web Worker
// The file that acc loads and runs Pyodide (Python) in a separate thread
// via messages in and out

// load custom backtesting harness code
import HARNESS from './harness.py?raw';

let pyodideReadyPromise: Promise<any> | null = null;

async function initPyodide() {
    const { loadPyodide } = await import(
        // @ts-ignore - Pyodide is loaded from a CDN URL, no local type declarations
        'https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.mjs'
    ); 

    const pyodide = await loadPyodide();
    await pyodide.loadPackage(['numpy', 'pandas']);
    return pyodide;
}

self.onmessage = async (e: MessageEvent) => {
    // Extract backtesting code and stock data needed to execude the backtest
    const { code, data } = e.data;

    if (!pyodideReadyPromise) {
        pyodideReadyPromise = initPyodide();
    }

    // Execute the backtested code
    try {
        const pyodide = await pyodideReadyPromise;

        pyodide.globals.set('raw_data', pyodide.toPy(data));

        // load preset code
        await pyodide.runPythonAsync(HARNESS + '\n' + code);
        // run custom user code
        const result = await pyodide.runPythonAsync(
            'run_backtest(MyStrategy, raw_data)'
        );

        self.postMessage({
            success: true,
            result: result.toJs({ dict_converter: Object.fromEntries }),
        });
    } catch (err: any) {
        self.postMessage({ success: false, error: err.message });
    }
};