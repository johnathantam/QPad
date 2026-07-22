import { Group, Panel, Separator } from "react-resizable-panels";
import { StrategyEditorPanel } from "../strategyEditorPanel/StrategyEditorPanel";
import "./view.css";

function AppView() {
  return (
    <Group orientation="vertical" className="view-container">
      {/* Top row: two panels side by side */}
      <Panel defaultSize={70} minSize={20}>
        <Group orientation="horizontal">
          <Panel defaultSize={50} minSize={15}>
            <div>Panel A</div>
          </Panel>
          <Separator style={{ width: 4, background: "#ccc" }} />
          <Panel minSize={15}>
            <div className="view-panel-content">
              <StrategyEditorPanel />
            </div>
          </Panel>
        </Group>
      </Panel>

      <Separator style={{ height: 4, background: "#ccc" }} />

      {/* Bottom row: terminal, full width */}
      <Panel defaultSize={30} minSize={10}>
        <div>Terminal</div>
      </Panel>
    </Group>
  );
}

export { AppView };