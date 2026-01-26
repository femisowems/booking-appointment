import React from 'react';
import './PriceSummary.css';

interface PriceSummaryProps {
    unitPrice: number;
    count: number;
}

export const PriceSummary: React.FC<PriceSummaryProps> = ({ unitPrice, count }) => {
    const total = unitPrice * count;

    if (count === 0) return null;

    return (
        <div className="price-summary">
            <span className="price-label">Total</span>
            <span className="price-total">
                ${total.toFixed(2)}
            </span>
        </div>
    );
};
