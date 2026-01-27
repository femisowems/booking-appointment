import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { EventCard } from './EventCard';
import { MyTickets } from './MyTickets';
import './TicketBookingFlow.css';

interface Event {
    id: string; // providerId
    name: string;
    venue: string;
}

interface Ticket {
    id: string;
    eventName: string;
    timeString: string;
    count: number;
    status: string;
    rawTime: string; // For sorting if needed
}

export const TicketBookingFlow: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [tickets, setTickets] = useState<Ticket[]>([]);

    // Mock User ID
    const userId = 'user-demo';

    useEffect(() => {
        // Fallback: Mock mock events for the demo
        const mockEvents: Event[] = [
            { id: 'event-1', name: 'Late Night Comedy', venue: 'The Basement Club' },
            { id: 'event-2', name: 'Jazz Quartet', venue: 'Blue Note Lounge' },
            { id: 'event-3', name: 'Indie Film Festival', venue: 'Cinema 4' },
            { id: 'event-4', name: 'Tech Conference 2026', venue: 'Convention Center' },
            { id: 'event-5', name: 'Live Podcast Recording', venue: 'Studio A' },
            { id: 'event-6', name: 'Charity Gala', venue: 'Grand Ballroom' },
        ];
        setEvents(mockEvents);
    }, []);

    const handleReserve = async (eventId: string, start: string, end: string, count: number) => {
        // 1. Optimistic UI update
        const event = events.find(e => e.id === eventId);
        const eventName = event?.name || 'Unknown Event';
        const tempId = 'temp-' + Date.now();
        const timeDisplay = new Date(start).toLocaleString(undefined, {
            weekday: 'short', month: 'short', day: 'numeric',
            hour: 'numeric', minute: '2-digit'
        });

        const newTicket: Ticket = {
            id: tempId,
            eventName,
            timeString: timeDisplay,
            count,
            status: 'PENDING',
            rawTime: start
        };

        setTickets(prev => [newTicket, ...prev]);

        try {
            // 2. Call API
            const result = await api.createReservation(userId, eventId, start, end, count);

            // 3. Update with real ID and Confirmed status
            setTimeout(() => {
                setTickets(prev => prev.map(t =>
                    t.id === tempId ? { ...t, id: result.id, status: result.status } : t
                ));
            }, 1200);

        } catch (err) {
            console.error(err);
            setTickets(prev => prev.map(t =>
                t.id === tempId ? { ...t, status: 'FAILED' } : t
            ));
        }
    };

    return (
        <div className="ticket-flow-container">
            <header className="flow-header">
                <h1 className="app-title">Upcoming Events</h1>
                <p className="app-subtitle">Select an event below to reserve your tickets.</p>
            </header>

            <div className="events-grid">
                {events.map(event => (
                    <EventCard
                        key={event.id}
                        id={event.id}
                        name={event.name}
                        venue={event.venue}
                        onReserve={handleReserve}
                    />
                ))}
            </div>

            <div className="my-tickets-divider">
                {tickets.length > 0 && <span>Your Reservations</span>}
            </div>

            <MyTickets tickets={tickets} />
        </div>
    );
};
