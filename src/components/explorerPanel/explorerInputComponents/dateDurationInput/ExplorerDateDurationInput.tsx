import "./explorerDateDurationInput.css";

interface ExplorerDateDurationInputProps {
    label: string;
    startDate: string;
    endDate: string;
    onStartDateChange: (date: string) => void;
    onEndDateChange: (date: string) => void;
}

function ExplorerDateDurationInput({
    label,
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
}: ExplorerDateDurationInputProps) {
    return (
        <div className="date-duration-input-container">
            <label className="date-duration-input-title">{label}</label>
            <div className="date-duration-input-row">
                <input
                    type="date"
                    value={startDate}
                    className="date-input"
                    max={endDate || undefined}
                    onChange={(e) => onStartDateChange(e.target.value)}
                />
                <span className="date-duration-separator">to</span>
                <input
                    type="date"
                    value={endDate}
                    className="date-input"
                    min={startDate || undefined}
                    onChange={(e) => onEndDateChange(e.target.value)}
                />
            </div>
        </div>
    );
}

export { ExplorerDateDurationInput };