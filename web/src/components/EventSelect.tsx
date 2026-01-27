import './EventSelect.css';

interface Event {
    id: string;
    name: string;
}

// Hardcoded for now, mimicking existing BookingForm
// In a real app, this would be fetched from /api/events
const EVENTS: Event[] = [
    { id: 'event-1', name: 'Late Night Comedy (The Basement Club)' },
    { id: 'event-2', name: 'Jazz Quartet (Blue Note Lounge)' },
    { id: 'event-3', name: 'Indie Film Festival (Cinema 4)' },
    { id: 'event-4', name: 'Tech Conference 2026 (Convention Center)' },
    { id: 'event-5', name: 'Live Podcast Recording (Studio A)' },
    { id: 'event-6', name: 'Charity Gala (Grand Ballroom)' },
];

interface EventSelectProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export const EventSelect = ({ value, onChange, disabled }: EventSelectProps) => {
    return (
        <div className="form-group">
            <label htmlFor="event-select" className="form-label">Select Event</label>
            <div className="select-wrapper">
                <select
                    id="event-select"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    className="form-select"
                >
                    {EVENTS.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};
