import { Header } from "../header/header";
import { PanelView } from "../panelView/panelView";
import "./appView.css";

function AppView() {
  return (
    <div className="view-container">
      <Header></Header>
      <PanelView></PanelView>
    </div>
  );
}

export { AppView };