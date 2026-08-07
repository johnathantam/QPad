import type { Bar } from '../types';

// pass all instruments in the universe
async function getAllInstrumentIds(): Promise<string[]> {
    const res = await fetch(
        `${import.meta.env.BASE_URL}data/sampleStockList/instruments.json`
    );

    if (!res.ok) {
        throw new Error("Failed to load instruments");
    }

    return res.json();
}

// takes instrument IDs (equity tickers for now) and fetches their historical data
async function loadInstrumentData(instrumentIds: string[], granularity: "Daily" | "Hourly"): Promise<Record<string, Bar[]>> {
    const entries = await Promise.all(
        instrumentIds.map(async (instrumentId) => {
            const res = await fetch(`${import.meta.env.BASE_URL}data/sampleStockUniverse/${granularity.toLowerCase()}/${instrumentId}.json`);
            if (!res.ok) {
                throw new Error(`Failed to load data for ${instrumentId}`);
            }

            const bars: Bar[] = await res.json();
            
            return [instrumentId, bars] as const;
        })
    );
    return Object.fromEntries(entries);
}

export { getAllInstrumentIds, loadInstrumentData };