export const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export interface Appointment {
  id: string;
  user_id: string;
  provider_id: string;
  start_time: string;
  end_time: string;
  status: 'BOOKED' | 'CANCELLED' | 'COMPLETED';
}

export const api = {
  createAppointment: async (userId: string, providerId: string, start: string, end: string) => {
    const url = `${API_BASE_URL}/appointments`;
    const payload = {
      user_id: userId,
      provider_id: providerId,
      start_time: start,
      end_time: end,
    };

    console.log(`[API] Creating appointment at ${url}`, payload);

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

  getAppointments: async (_userId: string) => {
    // In a real app we'd filter by user_id
    // but for this demo endpoint we might need adjustment or just use ID fetch
    // For list view we might rely on the read model API (not yet built for HTTP, just DynamoDB)
    // So let's stub this or just fetch by ID if we have one.
    return [];
  }
};
