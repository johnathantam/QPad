import { useState } from "react";
import { useBacktest } from "../../hooks/useBacktest";
import { StrategyEditor } from "../strategyEditor/StrategyEditor";

const DEFAULT_CODE: string = `class MyStrategy(Strategy):
    def on_start(self):
        pass

    def on_bar(self, date, bar):
        pass
`;


function StrategyPanel() {
    const [code, setCode] = useState(DEFAULT_CODE);
    const { state, run } = useBacktest();

    const handleRun = () => {
        run(code, ["AAPL", "MSFT"]);
    };

    return (
        <>
            <StrategyEditor value={code} onChange={setCode} />
            {/* <StrategyStats code={code} />       sibling reads current code */}
            {/* <BacktestButton code={code} />       sibling reads current code */}

            <button onClick={handleRun} disabled={state.status === "loading" || state.status === "running"}>
                {state.status === "loading" && "Loading data…"}
                {state.status === "running" && "Running…"}
                {(state.status === "idle" || state.status === "success" || state.status === "error") && "Run Backtest"}
            </button>

            {state.status === "error" && <div className="error">{state.error}</div>}

            {state.status === "success" && (
                <div className="results">
                    <p>P&L: {state.result.final_cash}</p>
                    {/* whatever else BacktestResult contains */}
                </div>
            )}
        </>
    );
}

export { StrategyPanel };