import "./panelView.css";
import { Group, Panel, Separator } from "react-resizable-panels";
import { ExplorerPanel } from "../explorerPanel/ExplorerPanel";
import { StrategyEditorPanel } from "../strategyEditorPanel/StrategyEditorPanel";
import { ResultsPanel } from "../resultsPanel/ResultsPanel";

function PanelView() {
    return (
        <>
            <Group orientation="vertical" className="panel-view-container">
                {/* Top row: two panels side by side */}
                <Panel defaultSize={70} minSize={20}>
                    <Group orientation="horizontal">
                        <Panel defaultSize={350} minSize={15}>
                            <div className="panel-view-content-container">
                                <ExplorerPanel />
                            </div>
                        </Panel>
                        <Separator style={{ width: 4, background: "#ccc" }} />
                        <Panel minSize={15}>
                            <div className="panel-view-content-container">
                                <StrategyEditorPanel />
                            </div>
                        </Panel>
                    </Group>
                </Panel>

                <Separator style={{ height: 4, background: "#ccc" }} />

                {/* Bottom row: terminal, full width */}
                <Panel defaultSize={30} minSize={10}>
                    <div className="panel-view-content-container">
                        <ResultsPanel></ResultsPanel>
                    </div>
                </Panel>
            </Group>
        </>
    )
}

export { PanelView }