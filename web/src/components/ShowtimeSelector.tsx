
import React, { useEffect, useState } from 'react';
import { useDraggableScroll } from '../hooks/useDraggableScroll';
import './ShowtimeSelector.css';

interface ShowtimeSelectorProps {
    eventId: string;
    date: Date;
    onSelectTime: (start: string, end: string) => void;
    selectedTime: string | null;
}

interface TimeSlot {
    start: string;
    end: string;
    available: boolean;
}

export const ShowtimeSelector: React.FC<ShowtimeSelectorProps> = ({ eventId, date, onSelectTime, selectedTime }) => {
    const [slots, setSlots] = useState<TimeSlot[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Drag hook
    const { ref, events } = useDraggableScroll();

    useEffect(() => {
        const fetchSlots = async () => {
            setLoading(true);
            setError('');
            try {
                // Generate slots based on the selected DATE
                const baseTime = new Date(date);
                baseTime.setMinutes(0, 0, 0);

                // If today, start next hour. If future date, start from 10 AM?
                const isToday = baseTime.getDate() === new Date().getDate();
                if (isToday) {
                    if (baseTime.getTime() < Date.now()) baseTime.setHours(new Date().getHours() + 1);
                } else {
                    baseTime.setHours(10); // Start at 10am for future dates
                }

                const generatedSlots: TimeSlot[] = [];
                // Generate more slots to demonstrate scrolling (e.g., 8 slots)
                for (let i = 0; i < 8; i++) {
                    const slotStart = new Date(baseTime);
                    slotStart.setHours(baseTime.getHours() + i);

                    const slotEnd = new Date(slotStart);
                    slotEnd.setHours(slotStart.getHours() + 1);

                    generatedSlots.push({
                        start: slotStart.toISOString(),
                        end: slotEnd.toISOString(),
                        available: true
                    });
                }
                setSlots(generatedSlots);

            } catch (err) {
                console.error(err);
                setError('Failed to load showtimes');
            } finally {
                setLoading(false);
            }
        };

        if (eventId) fetchSlots();
    }, [eventId, date]); // Re-run when date changes

    const
        formatTime = (iso: string) => {
            const d = new Date(iso);
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        };

    if (loading) return <div className="loading-slots">Loading showtimes...</div>;
    if (error) return <div className="error-slots">{error}</div>;

    return (
        <div
            className="showtime-list"
            ref={ref}
            onMouseDown={events.onMouseDown}
            onMouseLeave={events.onMouseLeave}
            onMouseUp={events.onMouseUp}
            onMouseMove={events.onMouseMove}
            style={events.style}
        >
            {slots.map((slot) => (
                <button
                    key={slot.start}
                    type="button"
                    className={`showtime-btn ${selectedTime === slot.start ? 'selected' : ''}`}
                    onClick={() => onSelectTime(slot.start, slot.end)}
                    disabled={!slot.available}
                >
                    {formatTime(slot.start)}
                </button>
            ))}
        </div>
    );
};
