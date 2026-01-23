import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type SyncState = 'SYNCED' | 'SYNCING' | 'OFFLINE' | 'ERROR';
export type ConfirmationState = 'CONFIRMED' | 'PENDING' | 'FAILED';

export interface AppointmentViewModel {
    id: string;
    user_id: string;
    provider_id: string;
    start_time: string;
    end_time: string;
    status: string;
    confirmationState: ConfirmationState;
    confirmedAt?: Date;
    confirmationRef?: string;
    hasConflict?: boolean;
    conflictingIds?: string[];
    version?: number;
    created_at?: string;
    updated_at?: string;
}

interface PendingAction {
    type: 'CANCEL' | 'RESCHEDULE' | 'CHECKIN';
    appointmentId: string;
    data?: any;
    timestamp: Date;
}

@Injectable({
    providedIn: 'root'
})
export class ScheduleService {
    private appointments$ = new BehaviorSubject<AppointmentViewModel[]>([]);
    private syncState$ = new BehaviorSubject<SyncState>('SYNCED');
    private lastSyncTime$ = new BehaviorSubject<Date | null>(null);
    private pendingActions: PendingAction[] = [];
    private apiBaseUrl = 'http://localhost:8080';

    constructor() {
        this.checkOnlineStatus();
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
    }

    getAppointments(): Observable<AppointmentViewModel[]> {
        return this.appointments$.asObservable();
    }

    getSyncState(): Observable<SyncState> {
        return this.syncState$.asObservable();
    }

    getLastSyncTime(): Observable<Date | null> {
        return this.lastSyncTime$.asObservable();
    }

    async refresh(providerId: string, startDate: Date, endDate: Date): Promise<void> {
        this.syncState$.next('SYNCING');

        try {
            const params = new URLSearchParams({
                provider_id: providerId,
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString()
            });

            const response = await fetch(`${this.apiBaseUrl}/appointments?${params.toString()}`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            const appointments = (data || []).map((appt: any) => this.mapToViewModel(appt));

            this.appointments$.next(appointments);
            this.lastSyncTime$.next(new Date());
            this.syncState$.next('SYNCED');
        } catch (error) {
            console.error('Failed to refresh appointments:', error);
            this.syncState$.next('ERROR');
            throw error;
        }
    }

    async cancelAppointment(id: string): Promise<void> {
        const traceId = crypto.randomUUID();

        // Optimistic update
        const current = this.appointments$.value;
        const targetIndex = current.findIndex(a => a.id === id);

        if (targetIndex === -1) return;

        const original = { ...current[targetIndex] };
        const updated = [...current];
        updated[targetIndex] = { ...original, status: 'CANCELLING' };
        this.appointments$.next(updated);

        try {
            const response = await fetch(`${this.apiBaseUrl}/appointments/${id}/cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Trace-ID': traceId
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to cancel: ${response.status}`);
            }

            // Remove the appointment on success
            this.appointments$.next(current.filter(a => a.id !== id));
        } catch (error) {
            console.error(`[TRACE: ${traceId}] Cancel failed:`, error);

            // Rollback on failure
            this.appointments$.next(current);

            // Queue for retry if offline
            if (!navigator.onLine) {
                this.queueAction({ type: 'CANCEL', appointmentId: id, timestamp: new Date() });
            }

            throw error;
        }
    }

    async rescheduleAppointment(id: string, newStartTime: Date, newEndTime: Date): Promise<void> {
        const current = this.appointments$.value;
        const targetIndex = current.findIndex(a => a.id === id);

        if (targetIndex === -1) return;

        const original = { ...current[targetIndex] };

        // Optimistic update
        const updated = [...current];
        updated[targetIndex] = {
            ...original,
            start_time: newStartTime.toISOString(),
            end_time: newEndTime.toISOString(),
            status: 'RESCHEDULING'
        };
        this.appointments$.next(updated);

        try {
            const response = await fetch(`${this.apiBaseUrl}/appointments/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    start_time: newStartTime.toISOString(),
                    end_time: newEndTime.toISOString(),
                    version: original.version
                })
            });

            if (!response.ok) {
                if (response.status === 409) {
                    throw new Error('CONFLICT');
                }
                throw new Error(`Failed to reschedule: ${response.status}`);
            }

            const result = await response.json();

            // Update with backend response
            updated[targetIndex] = this.mapToViewModel(result);
            this.appointments$.next(updated);
        } catch (error) {
            console.error('Reschedule failed:', error);

            // Rollback
            this.appointments$.next(current);

            throw error;
        }
    }

    async checkIn(id: string): Promise<void> {
        const current = this.appointments$.value;
        const targetIndex = current.findIndex(a => a.id === id);

        if (targetIndex === -1) return;

        // Optimistic update
        const updated = [...current];
        updated[targetIndex] = { ...updated[targetIndex], status: 'CHECKED_IN' };
        this.appointments$.next(updated);

        try {
            const response = await fetch(`${this.apiBaseUrl}/appointments/${id}/checkin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`Check-in failed: ${response.status}`);
            }
        } catch (error) {
            console.error('Check-in failed:', error);
            this.appointments$.next(current);
            throw error;
        }
    }

    private mapToViewModel(appt: any): AppointmentViewModel {
        return {
            id: appt.id,
            user_id: appt.user_id,
            provider_id: appt.provider_id,
            start_time: appt.start_time,
            end_time: appt.end_time,
            status: appt.status,
            confirmationState: appt.created_at ? 'CONFIRMED' : 'PENDING',
            confirmedAt: appt.created_at ? new Date(appt.created_at) : undefined,
            confirmationRef: appt.id ? `A-${appt.id.substring(0, 4).toUpperCase()}` : undefined,
            hasConflict: appt.has_conflict || false,
            conflictingIds: appt.conflicting_ids || [],
            version: appt.version,
            created_at: appt.created_at,
            updated_at: appt.updated_at
        };
    }

    private checkOnlineStatus(): void {
        if (!navigator.onLine) {
            this.syncState$.next('OFFLINE');
        }
    }

    private handleOnline(): void {
        console.log('Network reconnected, flushing pending actions...');
        this.syncState$.next('SYNCING');
        this.flushPendingActions();
    }

    private handleOffline(): void {
        console.log('Network offline');
        this.syncState$.next('OFFLINE');
    }

    private queueAction(action: PendingAction): void {
        this.pendingActions.push(action);
        // TODO: Persist to IndexedDB for true offline support
    }

    private async flushPendingActions(): Promise<void> {
        const actions = [...this.pendingActions];
        this.pendingActions = [];

        for (const action of actions) {
            try {
                switch (action.type) {
                    case 'CANCEL':
                        await this.cancelAppointment(action.appointmentId);
                        break;
                    case 'RESCHEDULE':
                        await this.rescheduleAppointment(
                            action.appointmentId,
                            new Date(action.data.start_time),
                            new Date(action.data.end_time)
                        );
                        break;
                    case 'CHECKIN':
                        await this.checkIn(action.appointmentId);
                        break;
                }
            } catch (error) {
                console.error('Failed to flush action:', action, error);
                this.pendingActions.push(action); // Re-queue on failure
            }
        }

        if (this.pendingActions.length === 0) {
            this.syncState$.next('SYNCED');
        }
    }
}
