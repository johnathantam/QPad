import Editor, { type OnChange } from '@monaco-editor/react';
import "./strategyEditor.css"

function StrategyEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const handleChange: OnChange = (v) => onChange(v ?? '');

  return (
    <div className="strategy-editor-container">
      <Editor
        defaultLanguage="python"
        value={value}
        onChange={handleChange}
        theme="vs-dark"
        options={{ minimap: { enabled: false }, fontSize: 14, automaticLayout: true }}
      />
    </div>
  );
}

export { StrategyEditor };