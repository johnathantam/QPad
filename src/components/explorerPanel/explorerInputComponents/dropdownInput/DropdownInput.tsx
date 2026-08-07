import "./dropdownInput.css";

interface ExplorerDropdownOption {
    label: string;
    value: string;
}

interface ExplorerDropdownInputProps {
    label: string;
    value: string;
    options: ExplorerDropdownOption[];
    onChange: (value: string) => void;
}

function ExplorerDropdownInput({ label, value, options, onChange }: ExplorerDropdownInputProps) {
    return (
        <div className="dropdown-input-container">
            <label className="dropdown-input-title">{label}</label>
            <select
                className="dropdown-input"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

export { ExplorerDropdownInput };
export type { ExplorerDropdownOption };