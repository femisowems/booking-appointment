import { useState, useEffect } from 'react';

export const useClock = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        // Update immediately
        setCurrentTime(new Date());

        // Update every minute
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const timeString = currentTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    const dateString = currentTime.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    return { currentTime, timeString, dateString };
};
