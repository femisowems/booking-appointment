import { Calendar } from 'primereact/calendar';
import type { FormEvent } from 'primereact/ts-helpers';
import './ProviderSelect.css'; // Reusing form styles

interface DatePickerProps {
    value: Date | null;
    onChange: (value: Date | null) => void;
    disabled?: boolean;
    min?: Date;
}

export const DatePicker = ({ value, onChange, disabled, min }: DatePickerProps) => {
    // Default min to today if not provided
    const minDate = min || new Date();

    return (
        <div className="form-group">
            <label htmlFor="date-picker" className="form-label">Date & Time</label>
            <Calendar
                inputId="date-picker"
                value={value}
                onChange={(e: FormEvent) => onChange(e.value || null)}
                disabled={disabled}
                minDate={minDate}
                dateFormat="yy-mm-dd"
                inline
                showTime
                hourFormat="12"
                className="w-full"
                required
            />
        </div>
    );
};
