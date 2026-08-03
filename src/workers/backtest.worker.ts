// This file is the Web Worker
// The file that acc loads and runs Pyodide (Python) in a separate thread
// via messages in and out

// load custom environment initialization code
import INITIALIZE from "./initialize_environment.py?raw";

// load custom backtesting harness code
import HARNESS from './harness.py?raw';

let pyodideReadyPromise: Promise<any> | null = null;

// initialize the pyodide environment so we can run python
async function initPyodide() {
    // grab pyodide package from a cdn
    const { loadPyodide } = await import(
        // @ts-ignore - Pyodide is loaded from a CDN URL, no local type declarations
        'https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.mjs'
    ); 

    // initialize pyodide
    const pyodide = await loadPyodide();

    // add packages numpy and pandas to our environment
    await pyodide.loadPackage(['numpy', 'pandas']);

    // establish connection from python to terminal panel
    pyodide.globals.set('_emit_log', (message: string, level: string = 'info') => {
        self.postMessage({ type: 'log', message, level });
    });

    // initialize python envirionment
    await pyodide.runPythonAsync(INITIALIZE);

    return pyodide;
}

// on call, expect new code and data -- in which we can run the backtest
self.onmessage = async (e: MessageEvent) => {
    // Extract backtesting code and stock data needed to execude the backtest
    const { code, backtestSettings, data } = e.data;

    if (!pyodideReadyPromise) {
        pyodideReadyPromise = initPyodide();
    }

    try {
        // wait for pyodide to load
        const pyodide = await pyodideReadyPromise;

        // set global info into python environment to use
        pyodide.globals.set('backtestSettings', pyodide.toPy(backtestSettings ?? {}));
        pyodide.globals.set('raw_data', pyodide.toPy(data));

        // load preset code
        await pyodide.runPythonAsync(HARNESS + '\n' + code);

        // run custom user code
        const result = await pyodide.runPythonAsync(
            'run_backtest(MyStrategy, backtestSettings, raw_data)'
        );

        self.postMessage({ type: 'result', success: true, result: result.toJs({ dict_converter: Object.fromEntries })});
    } catch (err: any) {
        self.postMessage({ type: 'result', success: false, error: err.message });
    }
};