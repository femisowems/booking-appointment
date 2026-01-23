import './ProviderSelect.css'; // Reusing form styles

interface TimePickerProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    availableTimes?: string[]; // Optional for future availability logic
}

export const TimePicker = ({ value, onChange, disabled }: TimePickerProps) => {
    // Get user's timezone
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return (
        <div className="form-group">
            <label htmlFor="time-picker" className="form-label">Time</label>
            <input
                id="time-picker"
                type="time"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="form-input"
                required
            />
            <small style={{ display: 'block', color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.85rem' }}>
                Times are shown in your local timezone ({timeZone})
            </small>
        </div>
    );
};
