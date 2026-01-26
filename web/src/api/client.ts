export const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export interface Reservation {
  id: string;
  user_id: string;
  event_id: string;
  start_time: string;
  end_time: string;
  ticket_count: number;
  status: 'BOOKED' | 'CANCELLED' | 'COMPLETED';
}

export const api = {
  createReservation: async (userId: string, eventId: string, start: string, end: string, ticketCount: number) => {
    const url = `${API_BASE_URL}/reservations`;
    const payload = {
      user_id: userId,
      event_id: eventId,
      start_time: start,
      end_time: end,
      ticket_count: ticketCount,
    };

    console.log(`[API] Creating reservation at ${url}`, payload);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;
        try {
          const errorText = await response.text();
          if (errorText) errorMessage += ` - ${errorText}`;
        } catch (e) {
          // ignore JSON parse error
        }
        console.error(`[API] Create failed:`, errorMessage);
        throw new Error(errorMessage);
      }
      return response.json();
    } catch (error) {
      console.error(`[API] Network or Logic Error:`, error);
      throw error;
    }
  },

  getReservations: async (_userId: string) => {
    // In a real app we'd filter by user_id
    // but for this demo endpoint we might need adjustment or just use ID fetch
    // For list view we might rely on the read model API (not yet built for HTTP, just DynamoDB)
    // So let's stub this or just fetch by ID if we have one.
    return [];
  }
};
