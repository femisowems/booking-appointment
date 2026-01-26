import React, { useState } from 'react';
import { ShowtimeSelector } from './ShowtimeSelector';
import { QuantityControl } from './QuantityControl';
import { PriceSummary } from './PriceSummary';
import { DateSelector } from './DateSelector';
import './EventCard.css';

interface EventCardProps {
    id: string; // event-X
    name: string;
    venue: string;
    onReserve: (eventId: string, start: string, end: string, count: number) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ id, name, venue, onReserve }) => {
    const [expanded, setExpanded] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
    const [ticketCount, setTicketCount] = useState(2);
    const [isReserving, setIsReserving] = useState(false);

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        setSelectedSlot(null); // Reset time when date changes
    };

    const handleSelectTime = (start: string, end: string) => {
        setSelectedSlot({ start, end });
    };

    const handleReserveClick = async () => {
        if (selectedSlot) {
            setIsReserving(true);
            // Simulate brief loading for UX confidence
            await onReserve(id, selectedSlot.start, selectedSlot.end, ticketCount);
            setIsReserving(false);
            // Reset logic could go here if needed, but usually we just show success elsewhere
        }
    };

    return (
        <div className={`event-card ${expanded ? 'expanded' : ''}`}>
            <div className="card-header">
                <div className="header-content">
                    <h3 className="event-title">{name}</h3>
                    <div className="event-meta">
                        <span className="icon">📍</span>
                        <span className="venue-text">{venue}</span>
                    </div>
                </div>
                <button
                    className={`expand-btn ${expanded ? 'close-mode' : ''}`}
                    onClick={() => setExpanded(!expanded)}
                    aria-label={expanded ? "Close event details" : "View showtimes for this event"}
                >
                    {expanded ? "Close" : "View Showtimes"}
                </button>
            </div>

            {expanded && (
                <div className="card-body fade-in-down">
                    <div className="section-group">
                        <DateSelector
                            selectedDate={selectedDate}
                            onSelect={handleDateSelect}
                        />

                        <h4 className="section-heading">Select Showtime</h4>
                        <ShowtimeSelector
                            eventId={id}
                            date={selectedDate}
                            selectedTime={selectedSlot?.start || null}
                            onSelectTime={handleSelectTime}
                        />
                    </div>

                    <div className={`booking-controls ${selectedSlot ? 'visible' : ''}`}>
                        <div className="controls-row">
                            <div className="control-group">
                                <h4 className="section-heading">Tickets</h4>
                                <QuantityControl
                                    value={ticketCount}
                                    onChange={setTicketCount}
                                    min={1}
                                    max={10}
                                />
                            </div>
                            <div className="price-group">
                                <PriceSummary unitPrice={15} count={ticketCount} />
                            </div>
                        </div>

                        <button
                            className="primary-action-btn"
                            onClick={handleReserveClick}
                            disabled={!selectedSlot || isReserving}
                        >
                            {isReserving ? (
                                <span className="loading-dots">Reserving...</span>
                            ) : (
                                "Reserve Tickets"
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
