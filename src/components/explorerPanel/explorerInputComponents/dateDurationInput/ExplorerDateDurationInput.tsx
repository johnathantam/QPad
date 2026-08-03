import "./explorerDateDurationInput.css";

interface ExplorerDateDurationInputProps {
    label: string;
    startDate: string; // ISO format "YYYY-MM-DD" — what <input type="date"> expects
    endDate: string;
    // onStartDateChange: (date: string) => void;
    // onEndDateChange: (date: string) => void;
}

function ExplorerDateDurationInput({
    label,
    startDate,
    endDate,
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
                />
                <span className="date-duration-separator">to</span>
                <input
                    type="date"
                    value={endDate}
                    className="date-input"
                    min={startDate || undefined}
                />
            </div>
        </div>
    );
}

export { ExplorerDateDurationInput };