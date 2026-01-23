import React from 'react';
import './BookingCard.css';

interface BookingCardProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const BookingCard = ({ children, title, subtitle }: BookingCardProps) => {
  return (
    <div className="booking-card">
      <div className="booking-card-header">
        <h2 className="booking-title">{title}</h2>
        {subtitle && <p className="booking-subtitle">{subtitle}</p>}
      </div>
      <div className="booking-card-content">
        {children}
      </div>
    </div>
  );
};
