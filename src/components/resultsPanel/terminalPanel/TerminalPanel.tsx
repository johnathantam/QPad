import { useEffect, useRef } from "react";
import { useCodeEditorStore } from "../../../store/useCodeEditorStore";
import "./terminalPanel.css";

function TerminalPanel() {
    const logs = useCodeEditorStore((s) => s.backtestLogs);
    const clearLogs = useCodeEditorStore((s) => s.clearBacktestLogs);

    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    return (
        <div className="terminal-panel-wrapper">
            <button className="terminal-clear-button" onClick={clearLogs} disabled={!logs || logs.length === 0}>
                Clear
            </button>

            {!logs || logs.length === 0 ? (
                <div className="terminal-log-list">
                    <div className="terminal-panel-empty">Run a backtest to see output here.</div>
                </div>
            ) : (
                <div className="terminal-log-list">
                    {logs.map((log) => (
                        <div key={log.id} className={`terminal-line ${log.level ?? "info"}`}>
                            {log.timestamp && <span className="terminal-line-timestamp">{log.timestamp}</span>}
                            <span className="terminal-line-prefix">
                                {log.level === "error" ? "✕" : log.level === "success" ? "✓" : log.level === "warn" ? "!" : "›"}
                            </span>
                            <span className="terminal-line-message">{log.message}</span>
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>
            )}
        </div>
    );
}
export { TerminalPanel };