import React from 'react';
import { useDraggableScroll } from '../hooks/useDraggableScroll';
import './DateSelector.css';

interface DateSelectorProps {
    selectedDate: Date;
    onSelect: (date: Date) => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({ selectedDate, onSelect }) => {
    const { ref, events } = useDraggableScroll();

    // Generate next 7 days
    const dates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        d.setHours(0, 0, 0, 0); // Normalize time
        return d;
    });

    const isSameDate = (d1: Date, d2: Date) => {
        return d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();
    };

    const formatLabel = (date: Date, index: number) => {
        if (index === 0) return 'Today';
        if (index === 1) return 'Tomorrow';
        return date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' });
    };

    return (
        <div
            className="date-selector"
            ref={ref}
            {...events} // Spread events for cleaner code (works if events object matches handlers)
            style={events.style}
        >
            {dates.map((date, index) => {
                const isSelected = isSameDate(date, selectedDate);
                return (
                    <button
                        key={date.toISOString()}
                        className={`date-pill ${isSelected ? 'selected' : ''}`}
                        onClick={() => onSelect(date)}
                        type="button"
                    >
                        {formatLabel(date, index)}
                    </button>
                );
            })}
        </div>
    );
};
