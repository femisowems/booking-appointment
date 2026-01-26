
import React from 'react';
import './TicketCounter.css';

interface TicketCounterProps {
    count: number;
    onChange: (count: number) => void;
    min?: number;
    max?: number;
}

export const TicketCounter: React.FC<TicketCounterProps> = ({ count, onChange, min = 1, max = 6 }) => {
    const increment = () => {
        if (count < max) onChange(count + 1);
    };

    const decrement = () => {
        if (count > min) onChange(count - 1);
    };

    return (
        <div className="ticket-counter">
            <button
                type="button"
                onClick={decrement}
                disabled={count <= min}
                className="counter-btn"
            >
                -
            </button>
            <span className="count-display">{count}</span>
            <button
                type="button"
                onClick={increment}
                disabled={count >= max}
                className="counter-btn"
            >
                +
            </button>
        </div>
    );
};
