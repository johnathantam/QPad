import { useEffect, useMemo, useState } from "react";
import { getAllInstrumentIds } from "../../../lib/loadData";
import { useCodeEditorStore } from "../../../store/useCodeEditorStore";
import "./universeViewer.css";

function getSymbolGrey(symbol: string) {
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) {
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Keep greys between 90-180
  const grey = 90 + (Math.abs(hash) % 90);
  return `rgb(${grey}, ${grey}, ${grey})`;
}

function UniverseViewer() {
    const [query, setQuery] = useState("");
    const [availableSymbols, setAvailableSymbols] = useState<string[]>([]);

    const backtestUniverse = useCodeEditorStore((s) => s.backtestUniverse);
    const setBacktestUniverse = useCodeEditorStore((s) => s.setBacktestUniverse);

    useEffect(() => {
        async function loadSymbols() {
            const symbols = await getAllInstrumentIds();
            setAvailableSymbols(symbols);
        }
        loadSymbols();
    }, []);

    const filtered = useMemo(() => {
        const q = query.trim().toUpperCase();
        if (!q) return availableSymbols;
        return availableSymbols.filter((symbol) =>
            symbol.includes(q)
        );
    }, [query, availableSymbols]);

    const toggleSymbol = (symbol: string) => {
        setBacktestUniverse(
            backtestUniverse.includes(symbol)
                ? backtestUniverse.filter((s) => s !== symbol)
                : [...backtestUniverse, symbol]
        );
    };

    return (
        <div className="universe-viewer-picker">
            <p className="universe-viewer-picker-note">
                Select stocks to include in your universe. By selecting a stock from here, you will able to trade it in your backtest.
            </p>
            <div className="universe-viewer-picker-header">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search symbols…"
                    className="universe-viewer-picker-search"
                    aria-label="Search stock symbols"
                />
                <span className="universe-viewer-picker-count">
                    {backtestUniverse.length} selected
                </span>
            </div>
            <div className="universe-viewer-picker-grid">
                {filtered.length === 0 ? (
                    <div className="universe-viewer-picker-empty">
                        {availableSymbols.length === 0
                            ? "Loading symbols..."
                            : `No symbols match "${query}"`}
                    </div>
                ) : (
                    filtered.map((symbol) => {
                        const isSelected = backtestUniverse.includes(symbol);
                        return (
                            <button
                                key={symbol}
                                type="button"
                                className={`universe-viewer-chip ${isSelected ? "selected" : ""}`}
                                style={!isSelected ? { color: getSymbolGrey(symbol) } : undefined}
                                onClick={() => toggleSymbol(symbol)}
                                aria-pressed={isSelected}
                            >
                                {symbol}
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}
export { UniverseViewer };