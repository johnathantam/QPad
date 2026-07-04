import type { Bar } from '../types';

// this function takes in stock symbols and fetches their historical data
async function loadSymbols(symbols: string[]): Promise<Record<string, Bar[]>> {
    const entries = await Promise.all(
        symbols.map(async (symbol) => {
            const res = await fetch(`/data/sampleStockUniverse/${symbol}.json`);
            if (!res.ok) {
                throw new Error(`Failed to load data for ${symbol}`);
            }

            const bars: Bar[] = await res.json();

            return [symbol, bars] as const;
        })
    );
    return Object.fromEntries(entries);
}

export { loadSymbols };