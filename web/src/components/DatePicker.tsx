import './ProviderSelect.css'; // Reusing form styles

interface DatePickerProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    min?: string;
}

export const DatePicker = ({ value, onChange, disabled, min }: DatePickerProps) => {
    // Default min to today if not provided
    const minDate = min || new Date().toISOString().split('T')[0];

    return (
        <div className="form-group">
            <label htmlFor="date-picker" className="form-label">Date</label>
            <input
                id="date-picker"
                type="date"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                min={minDate}
                className="form-input"
                required
            />
        </div>
    );
};
