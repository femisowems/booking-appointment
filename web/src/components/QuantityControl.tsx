import React from 'react';
import './QuantityControl.css';

interface QuantityControlProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    disabled?: boolean;
}

export const QuantityControl: React.FC<QuantityControlProps> = ({
    value,
    onChange,
    min = 1,
    max = 10,
    disabled = false
}) => {
    const handleDecrement = () => {
        if (!disabled && value > min) {
            onChange(value - 1);
        }
    };

    const handleIncrement = () => {
        if (!disabled && value < max) {
            onChange(value + 1);
        }
    };

    return (
        <div className="quantity-control">
            <button
                type="button"
                className="qty-btn"
                onClick={handleDecrement}
                disabled={disabled || value <= min}
                aria-label="Decrease quantity"
            >
                −
            </button>
            <span className="qty-value">{value}</span>
            <button
                type="button"
                className="qty-btn"
                onClick={handleIncrement}
                disabled={disabled || value >= max}
                aria-label="Increase quantity"
            >
                +
            </button>
        </div>
    );
};
