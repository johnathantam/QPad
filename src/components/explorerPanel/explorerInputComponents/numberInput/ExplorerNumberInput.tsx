import "./explorerNumberInput.css";

interface ExplorerNumberInputProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
}

function ExplorerNumberInput({ label, value, onChange }: ExplorerNumberInputProps) {
    return (
        <div className="number-input-container">
            <label className="number-input-title">{label}</label>
            <input
                type="number"
                value={value}
                className="number-input"
                onChange={(e) => onChange(e.target.valueAsNumber)}
            />
        </div>
    );
}

export { ExplorerNumberInput };