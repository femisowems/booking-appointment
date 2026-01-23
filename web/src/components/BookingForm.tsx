import { useState } from 'react';
import { api } from '../api/client';
import { BookingCard } from './BookingCard';
import { ProviderSelect } from './ProviderSelect';
import { DatePicker } from './DatePicker';
import { TimePicker } from './TimePicker';
import { BookingSummary } from './BookingSummary';
import { BookingStatus, type StatusType } from './BookingStatus';
import './BookingStatus.css';
import './BookingForm.css';

export const BookingForm = () => {
    const [providerId, setProviderId] = useState('provider-1');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    // Status state
    const [status, setStatus] = useState<StatusType>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic Validation
        if (!date || !time) {
            setStatus('error');
            setMessage('Please select both a date and a time.');
            return;
        }

        setStatus('loading');
        setMessage('Confirming your appointment...');

        try {
            // Construct datetime in LOCAL timezone, then convert to UTC for backend
            const localDateTime = new Date(`${date}T${time}`);

            // Validate future date
            if (localDateTime < new Date()) {
                setStatus('error');
                setMessage('Please select a future date and time.');
                return;
            }

            // Convert to ISO (UTC) for backend
            const start = localDateTime.toISOString();
            // Add 1 hour for end time
            const end = new Date(localDateTime.getTime() + 60 * 60 * 1000).toISOString();

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
                            value={date}
                            onChange={setDate}
                            disabled={isSubmitting}
                        />
                        <TimePicker
                            value={time}
                            onChange={setTime}
                            disabled={isSubmitting}
                        />
                    </div>

                    <BookingSummary
                        providerName={getProviderName(providerId)}
                        date={date}
                        time={time}
                    />

                    <button
                        type="submit"
                        disabled={isSubmitting || !date || !time}
                        className="btn-primary"
                    >
                        {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
                    </button>
                </form>
            ) : (
                <div className="success-actions">
                    <BookingSummary
                        providerName={getProviderName(providerId)}
                        date={date}
                        time={time}
                    />
                    <button
                        onClick={() => {
                            setStatus('idle');
                            setDate('');
                            setTime('');
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
