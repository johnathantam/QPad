import "./explorerPanel.css";
import { BacktesterDocument } from "./backtesterDocument/BacktesterDocument";
import { CollapsibleSection } from "./collapsiblePanelSection/CollapsiblePanelSection";
import { ExplorerNumberInput } from "./explorerInputComponents/numberInput/ExplorerNumberInput";
import { ExplorerDateDurationInput } from "./explorerInputComponents/dateDurationInput/ExplorerDateDurationInput";
import { useCodeEditorStore } from "../../store/useCodeEditorStore"; // adjust path to match your project
import { useEffect } from "react";

function ExplorerPanel() {
    const settings = useCodeEditorStore((s) => s.backtestSettings);
    const setSettings = useCodeEditorStore((s) => s.setBacktestSettings);

    useEffect(() => {
        console.log(settings)
    }, [settings])

    return (
        <>
            <div className="explorer-panel-container">
                <div className="explorer-header-container">
                    <p className="explorer-panel-description">BACKTESTING-KIT</p>
                    <h2 className="explorer-panel-title">SETTINGS EXPLORER</h2>
                </div>
                <CollapsibleSection title="Initial Settings" defaultOpen>
                    <ExplorerNumberInput
                        label="Starting Capital ($)"
                        value={settings.startingCapital}
                        onChange={(v) => setSettings({ startingCapital: v })}
                    />
                    <ExplorerNumberInput
                        label="Commission Per Trade ($)"
                        value={settings.commissionPerTrade}
                        onChange={(v) => setSettings({ commissionPerTrade: v })}
                    />
                    <ExplorerDateDurationInput
                        label="Backtest Period"
                        startDate={settings.startDate}
                        endDate={settings.endDate}
                        onStartDateChange={(date) => setSettings({ startDate: date })}
                        onEndDateChange={(date) => setSettings({ endDate: date })}
                    />
                </CollapsibleSection>
                <CollapsibleSection title="Concurrent Settings" defaultOpen>
                    <ExplorerNumberInput
                        label="Slippage per trade (%)"
                        value={settings.slippagePercentage}
                        onChange={(v) => setSettings({ slippagePercentage: v })}
                    />
                </CollapsibleSection>
                <CollapsibleSection title="Docs" defaultOpen>
                    <BacktesterDocument></BacktesterDocument>
                </CollapsibleSection>
            </div>
        </>
    );
}

export { ExplorerPanel };