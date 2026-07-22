// import { useState } from "react";
// import { useBacktest } from "../../hooks/useBacktest";
// import { StrategyEditor } from "../strategyEditor/StrategyEditor";
// import "./strategyEditorPanel.css";

// const DEFAULT_CODE: string = `class MyStrategy(Strategy):
//     def on_start(self):
//         pass

//     def on_bar(self, date, bar):
//         pass
// `;

// function StrategyEditorPanel() {
//     const [code, setCode] = useState(DEFAULT_CODE);
//     const { state, run } = useBacktest();

//     const handleRun = () => {
//         run(code, ["AAPL", "MSFT"]);
//     };

//     return (
//         <>  
//         <div className="strategy-editor-panel-container">
//             <StrategyEditor value={code} onChange={setCode} />
//         </div>

//             {/* <button onClick={handleRun} disabled={state.status === "loading" || state.status === "running"}>
//                 {state.status === "loading" && "Loading data…"}
//                 {state.status === "running" && "Running…"}
//                 {(state.status === "idle" || state.status === "success" || state.status === "error") && "Run Backtest"}
//             </button>

//             {state.status === "error" && <div className="error">{state.error}</div>}

//             {state.status === "success" && (
//                 <div className="results">
//                     <p>P&L: {state.result.final_cash}</p>
//                 </div>
//             )} */}
//         </>
//     );
// }

// export { StrategyEditorPanel };

import { useCodeEditorStore } from "../../store/useCodeEditorStore";
import { StrategyEditor } from "../strategyEditor/StrategyEditor";
import "./strategyEditorPanel.css";

function StrategyEditorPanel() {
  const code = useCodeEditorStore((set) => set.code);
  const setCode = useCodeEditorStore((set) => set.setCode);

  // Sync the local useBacktest result into the shared store
  // whenever it changes, so other components (e.g. Header) can read it.
//   useEffect(() => {
//     if (state.status === 'success') {
//       setBacktestState('success', state.result, null);
//     } else if (state.status === 'error') {
//       setBacktestState('error', null, state.error);
//     } else {
//       setBacktestState(state.status);
//     }
//   }, [state, setBacktestState]);

//   const handleRun = () => {
//     run(code, ["AAPL", "MSFT"]);
//   };

  return (
    <div className="strategy-editor-panel-container">
      <StrategyEditor value={code} onChange={setCode} />
    </div>
  );
}

export { StrategyEditorPanel };