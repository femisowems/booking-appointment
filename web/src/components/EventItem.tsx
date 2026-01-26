
import React, { useState } from 'react';
import { ShowtimeSelector } from './ShowtimeSelector';
import './EventItem.css';
import { TicketCounter } from './TicketCounter';

interface EventItemProps {
    id: string; // providerId
    name: string;
    venue: string; // Mapped from timezone or mocked
    onReserve: (providerId: string, start: string, end: string, count: number) => void;
}

export const EventItem: React.FC<EventItemProps> = ({ id, name, venue, onReserve }) => {
    const [expanded, setExpanded] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
    const [ticketCount, setTicketCount] = useState(2);

    const handleSelectTime = (start: string, end: string) => {
        setSelectedSlot({ start, end });
    };

    const handleReserveClick = () => {
        if (selectedSlot) {
            onReserve(id, selectedSlot.start, selectedSlot.end, ticketCount);
        }
    };

    return (
        <div className={`event-item ${expanded ? 'expanded' : ''}`}>
            <div className="event-header">
                <div className="event-info">
                    <h3 className="event-name">{name}</h3>
                    <p className="event-venue">{venue}</p>
                </div>
                {!expanded && (
                    <button className="view-showtimes-btn" onClick={() => setExpanded(true)}>
                        View Showtimes
                    </button>
                )}
            </div>

            {expanded && (
                <div className="event-details fade-in">
                    <div className="section-label">Select Showtime</div>
                    <ShowtimeSelector
                        eventId={id}
                        selectedTime={selectedSlot?.start || null}
                        onSelectTime={handleSelectTime}
                    />

                    {selectedSlot && (
                        <div className="booking-actions fade-in">
                            <div className="ticket-q-section">
                                <div className="section-label">Quantity</div>
                                <TicketCounter
                                    count={ticketCount}
                                    onChange={setTicketCount}
                                />
                                <div className="price-display">
                                    ${ticketCount * 15}.00
                                </div>
                            </div>

                            <button className="reserve-btn" onClick={handleReserveClick}>
                                Reserve Tickets
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
