import './ProviderSelect.css';

interface Provider {
    id: string;
    name: string;
}

// Hardcoded for now, mimicking existing BookingForm
const PROVIDERS: Provider[] = [
    { id: 'provider-1', name: 'Dr. Smith' },
    { id: 'provider-2', name: 'Dr. Jones' },
];

interface ProviderSelectProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export const ProviderSelect = ({ value, onChange, disabled }: ProviderSelectProps) => {
    return (
        <div className="form-group">
            <label htmlFor="provider-select" className="form-label">Select Provider</label>
            <div className="select-wrapper">
                <select
                    id="provider-select"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    className="form-select"
                >
                    {PROVIDERS.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};
