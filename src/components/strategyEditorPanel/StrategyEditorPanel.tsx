import { useEffect } from "react";
import { useCodeEditorStore } from "../../store/useCodeEditorStore";
import { StrategyEditor } from "./strategyEditor/StrategyEditor";
import "./strategyEditorPanel.css";

function StrategyEditorPanel() {
  const code = useCodeEditorStore((set) => set.code);
  const setCode = useCodeEditorStore((set) => set.setCode);
  const status = useCodeEditorStore((set) => set.backtestStatus);
  const runBacktest = useCodeEditorStore((set) => set.runBacktest);
  const result = useCodeEditorStore((set) => set.backtestResult);

  const handleRun = () => {
    runBacktest(["AAPL"]);
  };

  useEffect(() => {
    if (result) {
      console.log("Backtest result:", result);
    }
  }, [result]);

  // runBacktest(["AAPL", "MSFT"]);

  return (
    <div className="strategy-editor-panel-container">
       <div className="strategy-editor-panel-header">
        <span className="strategy-editor-panel-title">strategy.py</span>
        <button
          className="strategy-editor-run-button"
          onClick={handleRun}
          disabled={status === "running"}
        >
          {status === "running" ? "Running…" : "▶ Run"}
        </button>
      </div> 

      <div className="strategy-editor-code-container">
        <StrategyEditor value={code} onChange={setCode} />
      </div>
    </div>
  );
}

export { StrategyEditorPanel };