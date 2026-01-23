import './BookingStatus.css';

export type StatusType = 'idle' | 'loading' | 'success' | 'error';

interface BookingStatusProps {
    status: StatusType;
    message?: string;
    onDismiss?: () => void;
}

export const BookingStatus = ({ status, message, onDismiss }: BookingStatusProps) => {
    if (status === 'idle') return null;

    return (
        <div
            className={`booking-status status-${status}`}
            role={status === 'error' ? 'alert' : 'status'}
            aria-live="polite"
        >
            <div className="status-icon">
                {status === 'loading' && <span className="spinner" />}
                {status === 'success' && '✅'}
                {status === 'error' && '⚠️'}
            </div>
            <div className="status-content">
                <span className="status-message">{message}</span>
            </div>
            {status === 'error' && onDismiss && (
                <button
                    onClick={onDismiss}
                    className="status-dismiss"
                    aria-label="Dismiss error"
                >
                    ✕
                </button>
            )}
        </div>
    );
};
