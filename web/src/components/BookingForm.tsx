import { useState } from 'react';
import { api } from '../api/client';
import { BookingCard } from './BookingCard';
import { EventSelect } from './EventSelect';
import { DatePicker } from './DatePicker';
import { BookingSummary } from './BookingSummary';
import { BookingStatus, type StatusType } from './BookingStatus';
import './BookingStatus.css';
import './BookingForm.css';

export const BookingForm = () => {
    const [eventId, setEventId] = useState('event-1');
    const [startDateTime, setStartDateTime] = useState<Date | null>(null);

    // Status state
    const [status, setStatus] = useState<StatusType>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic Validation
        if (!startDateTime) {
            setStatus('error');
            setMessage('Please select a date and time.');
            return;
        }

        setStatus('loading');
        setMessage('Confirming your reservation...');

        try {
            // Validate future date
            if (startDateTime < new Date()) {
                setStatus('error');
                setMessage('Please select a future date and time.');
                return;
            }

            // Convert to ISO (UTC) for backend
            const start = startDateTime.toISOString();
            // Add 1 hour for end time
            const end = new Date(startDateTime.getTime() + 60 * 60 * 1000).toISOString();

            const result = await api.createReservation('user-demo', eventId, start, end, 1);

            setStatus('success');
            setMessage(`Reservation confirmed! Reference ID: ${result.id}`);

            // Optional: Reset form after success or keep it to show confirmation
            // setDate('');
            // setTime('');
        } catch (err: any) {
            setStatus('error');
            setMessage(err.message || 'Failed to book. Please try again.');
        }
    };

    const handleDismissError = () => {
        setStatus('idle');
        setMessage('');
    };

    const getEventName = (id: string) => {
        if (id === 'event-1') return 'Late Night Comedy';
        if (id === 'event-2') return 'Jazz Quartet';
        if (id === 'event-3') return 'Indie Film Festival';
        return 'Unknown Event';
    }

    const isSubmitting = status === 'loading';
    const isSuccess = status === 'success';

    return (
        <BookingCard
            title={isSuccess ? "Reservation Confirmed" : "Book Reservation"}
            subtitle={isSuccess ? "Your details are below." : "Secure your slot"}
        >
            <BookingStatus status={status} message={message} onDismiss={handleDismissError} />

            {!isSuccess ? (
                <form onSubmit={handleSubmit} className="booking-form">
                    <EventSelect
                        value={eventId}
                        onChange={setEventId}
                        disabled={isSubmitting}
                    />

                    <div className="form-row">
                        <DatePicker
                            value={startDateTime}
                            onChange={setStartDateTime}
                            disabled={isSubmitting}
                        />
                    </div>

                    <BookingSummary
                        eventName={getEventName(eventId)}
                        date={startDateTime ? startDateTime.toISOString().split('T')[0] : ''}
                        time={startDateTime ? startDateTime.toTimeString().split(' ')[0].substring(0, 5) : ''}
                    />

                    <button
                        type="submit"
                        disabled={isSubmitting || !startDateTime}
                        className="btn-primary"
                    >
                        {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
                    </button>
                </form>
            ) : (
                <div className="success-actions">
                    <BookingSummary
                        eventName={getEventName(eventId)}
                        date={startDateTime ? startDateTime.toISOString().split('T')[0] : ''}
                        time={startDateTime ? startDateTime.toTimeString().split(' ')[0].substring(0, 5) : ''}
                    />
                    <button
                        onClick={() => {
                            setStatus('idle');
                            setStartDateTime(null);
                            setMessage('');
                        }}
                        className="btn-secondary"
                    >
                        Book Another Appointment
                    </button>
                </div>
            )}
        </BookingCard>
    );
};
