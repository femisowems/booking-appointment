import { useState } from 'react';
import { api } from '../api/client';
import { BookingCard } from './BookingCard';
import { ProviderSelect } from './ProviderSelect';
import { DatePicker } from './DatePicker';
import { BookingSummary } from './BookingSummary';
import { BookingStatus, type StatusType } from './BookingStatus';
import './BookingStatus.css';
import './BookingForm.css';

export const BookingForm = () => {
    const [providerId, setProviderId] = useState('provider-1');
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
        setMessage('Confirming your appointment...');

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

            const result = await api.createAppointment('user-demo', providerId, start, end);

            setStatus('success');
            setMessage(`Appointment confirmed! Reference ID: ${result.id}`);

            // Optional: Reset form after success or keep it to show confirmation
            // setDate('');
            // setTime('');
        } catch (err: any) {
            setStatus('error');
            setMessage(err.message || 'Failed to book appointment. Please try again.');
        }
    };

    const handleDismissError = () => {
        setStatus('idle');
        setMessage('');
    };

    const getProviderName = (id: string) => {
        if (id === 'provider-1') return 'Dr. Smith';
        if (id === 'provider-2') return 'Dr. Jones';
        return 'Unknown Provider';
    }

    const isSubmitting = status === 'loading';
    const isSuccess = status === 'success';

    return (
        <BookingCard
            title={isSuccess ? "Booking Confirmed" : "Book Confirmation"}
            subtitle={isSuccess ? "Your appointment details are below." : "Secure your slot with Dr. Smith or Dr. Jones"}
        >
            <BookingStatus status={status} message={message} onDismiss={handleDismissError} />

            {!isSuccess ? (
                <form onSubmit={handleSubmit} className="booking-form">
                    <ProviderSelect
                        value={providerId}
                        onChange={setProviderId}
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
                        providerName={getProviderName(providerId)}
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
                        providerName={getProviderName(providerId)}
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
