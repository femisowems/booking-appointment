
import React from 'react';
import './MyTickets.css';

interface Ticket {
    id: string;
    eventName: string;
    timeString: string;
    count: number;
    status: string;
}

interface MyTicketsProps {
    tickets: Ticket[];
}

export const MyTickets: React.FC<MyTicketsProps> = ({ tickets }) => {
    if (tickets.length === 0) return null;

    return (
        <div className="my-tickets-section">
            <h2 className="tickets-header">My Tickets</h2>
            <div className="tickets-list">
                {tickets.map((t) => (
                    <div key={t.id} className="ticket-card fade-in">
                        <div className="ticket-status-bar" data-status={t.status}>
                            {t.status === 'BOOKED' ? 'CONFIRMED' : t.status} {/* Mapped status for UI */}
                        </div>
                        <div className="ticket-content">
                            <div className="ticket-event">{t.eventName}</div>
                            <div className="ticket-time">{t.timeString}</div>
                            <div className="ticket-count">{t.count} Ticket{t.count > 1 ? 's' : ''}</div>
                            {t.status === 'PENDING' && <div className="pending-helper">Confirming reservation...</div>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
