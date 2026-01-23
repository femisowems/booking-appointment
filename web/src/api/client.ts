export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

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
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        provider_id: providerId,
        start_time: start,
        end_time: end,
      }),
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return response.json();
  },

  getAppointments: async (_userId: string) => {
    // In a real app we'd filter by user_id
    // but for this demo endpoint we might need adjustment or just use ID fetch
    // For list view we might rely on the read model API (not yet built for HTTP, just DynamoDB)
    // So let's stub this or just fetch by ID if we have one.
    return [];
  }
};
