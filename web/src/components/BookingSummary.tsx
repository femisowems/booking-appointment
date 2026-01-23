import './BookingSummary.css';

interface BookingSummaryProps {
    providerName: string;
    date: string;
    time: string;
}

export const BookingSummary = ({ providerName, date, time }: BookingSummaryProps) => {
    // Helper to format date nicely
    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        try {
            // Explicitly parse "YYYY-MM-DD" to valid year, month, day integers
            // to construct a date in the LOCAL timezone, avoiding UTC adjustments.
            const [year, month, day] = dateStr.split('-').map(Number);
            const d = new Date(year, month - 1, day);
            return d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        } catch {
            return dateStr;
        }
    };

    // Helper to format time (assuming HH:mm input)
    const formatTime = (timeStr: string) => {
        if (!timeStr) return '';
        try {
            // Create a dummy date with the time
            const [hours, minutes] = timeStr.split(':');
            const d = new Date();
            d.setHours(parseInt(hours), parseInt(minutes));
            return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
        } catch {
            return timeStr;
        }
    }

    if (!providerName && !date && !time) return null;

    return (
        <div className="booking-summary">
            <h3 className="summary-title">Summary</h3>
            <div className="summary-details">
                <div className="summary-item">
                    <span className="summary-label">Provider</span>
                    <span className="summary-value">{providerName || 'Pending...'}</span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">Date</span>
                    <span className="summary-value">{formatDate(date) || 'Pending...'}</span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">Time</span>
                    <span className="summary-value">{formatTime(time) || 'Pending...'}</span>
                </div>
            </div>
            {!date || !time ? (
                <div className="summary-hint">
                    Please select a date and time to continue.
                </div>
            ) : (
                <div className="summary-total">
                    <span className="total-label">Consultation Fee</span>
                    <span className="total-value">Standard Rate</span>
                </div>
            )}
        </div>
    );
};
