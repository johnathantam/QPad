import type { Bar } from '../types';

// takes instrument IDs (equity tickers for now) and fetches their historical data
async function loadInstrumentData(instrumentIds: string[]): Promise<Record<string, Bar[]>> {
    const entries = await Promise.all(
        instrumentIds.map(async (instrumentId) => {
            const res = await fetch(`/data/sampleStockUniverse/${instrumentId}.json`);
            if (!res.ok) {
                throw new Error(`Failed to load data for ${instrumentId}`);
            }

            const bars: Bar[] = await res.json();
            
            return [instrumentId, bars] as const;
        })
    );
    return Object.fromEntries(entries);
}

export { loadInstrumentData };