import "./explorerPanel.css";
import { BacktesterDocument } from "./backtesterDocument/BacktesterDocument";
import { CollapsibleSection } from "./collapsiblePanelSection/CollapsiblePanelSection";
import { ExplorerNumberInput } from "./explorerInputComponents/numberInput/ExplorerNumberInput";
import { ExplorerDateDurationInput } from "./explorerInputComponents/dateDurationInput/ExplorerDateDurationInput";

function ExplorerPanel() {
    return (
        <>
            <div className="explorer-panel-container">
                <div className="explorer-header-container">
                    <p className="explorer-panel-description">BACKTESTING-KIT</p>
                    <h2 className="explorer-panel-title">SETTINGS EXPLORER</h2>
                </div>

                <CollapsibleSection title="Initial Settings" defaultOpen>
                    <ExplorerNumberInput label="Starting Capital ($)" value={100000}></ExplorerNumberInput>
                    <ExplorerNumberInput label="Commission Per Trade ($)" value={0.00}></ExplorerNumberInput>
                    <ExplorerDateDurationInput
                        label="Backtest Period"
                        startDate={"2021-01-01"}
                        endDate={"2026-01-01"}
                    />
                </CollapsibleSection>

                <CollapsibleSection title="Concurrent Settings" defaultOpen>
                    <ExplorerNumberInput label="Slippage per trade (%)" value={0.00}></ExplorerNumberInput>
                </CollapsibleSection>

                <CollapsibleSection title="Docs" defaultOpen>
                    <BacktesterDocument></BacktesterDocument>
                </CollapsibleSection>
            </div>
        </>
    )
}

export { ExplorerPanel };