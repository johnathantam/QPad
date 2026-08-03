import { useState } from "react";
import { useCodeEditorStore } from "../../store/useCodeEditorStore";
import { TerminalPanel } from "./terminalPanel/TerminalPanel";
import { OutputPanel } from "./outputPanel/OutputPanel";
import "./resultsPanel.css";

type ResultsTab = "terminal" | "output";

function ResultsPanel() {
  const [activeTab, setActiveTab] = useState<ResultsTab>("terminal");

  // Adjust these selectors to match your actual store shape
  const status = useCodeEditorStore((s) => s.backtestStatus);

  return (
    <div className="terminal-panel-container">
      <div className="terminal-panel-header">
        <div className="terminal-panel-tabs">
          <button
            className={`terminal-panel-tab ${activeTab === "terminal" ? "active" : ""}`}
            onClick={() => setActiveTab("terminal")}
          >
            Terminal
          </button>
          <button
            className={`terminal-panel-tab ${activeTab === "output" ? "active" : ""}`}
            onClick={() => setActiveTab("output")}
          >
            Output
          </button>
        </div>
        <span className={`terminal-panel-status ${status ?? ""}`}>
          {status === "running" || status === "loading"
            ? "● Running"
            : status === "error"
            ? "● Error"
            : status === "success"
            ? "● Done"
            : "● Idle"}
        </span>
      </div>

      <div className="terminal-panel-body">
        {activeTab === "terminal" ? (
          <TerminalPanel />
        ) : (
          <OutputPanel />
        )}
      </div>
    </div>
  );
}

export { ResultsPanel };