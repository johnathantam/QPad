import "./explorerNumberInput.css";

interface ExplorerNumberInputProps {
    label: string;
    value: number;
    // onChange: (value: number) => void;
}

function ExplorerNumberInput(props: ExplorerNumberInputProps) {
    return (
        <>
            <div className="number-input-container">
                <label className="number-input-title">{props.label}</label>
                <input type="number" value={props.value} className="number-input" />
            </div>
        </>
    )
}

export { ExplorerNumberInput };