import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ModalController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ScheduleService, ReservationViewModel, SyncState } from '../services/schedule.service';
import { ScheduleGroupComponent, ScheduleSection } from '../components/schedule-group/schedule-group.component';
import { SyncIndicatorComponent } from '../components/sync-indicator/sync-indicator.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ScheduleGroupComponent, SyncIndicatorComponent]
})
export class HomePage implements OnInit, OnDestroy {
  sections: ScheduleSection[] = [];
  viewMode: 'day' | 'week' | 'month' = 'day';
  syncState: SyncState = 'SYNCED';
  lastSyncTime: Date | null = null;
  selectedEvent: string = 'event-1';
  currentTime: Date = new Date();
  private clockInterval?: number;

  // Available events
  // Available events
  events: any[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private scheduleService: ScheduleService,
    private alertController: AlertController,
    private modalController: ModalController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    // Subscribe to events
    this.scheduleService.getEvents()
      .pipe(takeUntil(this.destroy$))
      .subscribe(events => {
        this.events = events;

        // Auto-select first event if none selected or selection invalid
        if (this.events.length > 0) {
          if (!this.selectedEvent || !this.events.some(e => e.id === this.selectedEvent)) {
            this.selectedEvent = this.events[0].id;
            // Also save to storage so it persists
            localStorage.setItem('selectedEvent', this.selectedEvent);
            // Trigger load for this new selection
            this.loadReservations();
          }
        }
      });

    // Load saved event preference
    const savedEvent = localStorage.getItem('selectedEvent');
    if (savedEvent) {
      this.selectedEvent = savedEvent;
    }

    // Trigger loads
    this.scheduleService.refreshEvents();

    // Subscribe to reservations
    this.scheduleService.getReservations()
      .pipe(takeUntil(this.destroy$))
      .subscribe(reservations => {
        this.sections = this.groupReservations(reservations);
      });

    // Subscribe to sync state
    this.scheduleService.getSyncState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.syncState = state;
      });

    // Subscribe to last sync time
    this.scheduleService.getLastSyncTime()
      .pipe(takeUntil(this.destroy$))
      .subscribe(time => {
        this.lastSyncTime = time;
      });

    // Initial load
    this.loadReservations();

    // Start live clock
    this.startClock();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();

    // Clear clock interval
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
  }

  private startClock() {
    // Update immediately
    this.currentTime = new Date();

    // Update every minute
    this.clockInterval = window.setInterval(() => {
      this.currentTime = new Date();
    }, 60000); // 60 seconds
  }

  get currentTimeString(): string {
    return this.currentTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  get currentDateString(): string {
    return this.currentTime.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }


  async loadReservations() {
    const now = new Date();
    let start: Date, end: Date;

    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (this.viewMode === 'day') {
      start = startOfDay;
      end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    } else if (this.viewMode === 'week') {
      const day = startOfDay.getDay();
      start = new Date(startOfDay.getTime() - day * 24 * 60 * 60 * 1000);
      end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
    } else {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }

    try {
      await this.scheduleService.refresh(this.selectedEvent, start, end);
    } catch (error) {
      console.error('Failed to load reservations:', error);
      this.showErrorToast('Failed to load reservations');
    }
  }

  async handleCancel(id: string) {
    const reservation = this.findReservationById(id);
    if (!reservation) return;

    const alert = await this.alertController.create({
      header: 'Cancel Reservation?',
      message: `
        <strong>User:</strong> ${reservation.user_id}<br>
        <strong>Time:</strong> ${new Date(reservation.start_time).toLocaleString()}<br><br>
        This action cannot be undone.
      `,
      buttons: [
        {
          text: 'Go Back',
          role: 'cancel'
        },
        {
          text: 'Yes, Cancel',
          role: 'destructive',
          handler: async () => {
            try {
              await this.scheduleService.cancelReservation(id);
              this.showSuccessToast('Reservation cancelled');
            } catch (error) {
              console.error('Failed to cancel:', error);
              this.showErrorToast('Failed to cancel reservation');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async handleReschedule(id: string) {
    const reservation = this.findReservationById(id);
    if (!reservation) return;

    const alert = await this.alertController.create({
      header: 'Reschedule Reservation',
      message: 'This feature opens a datetime picker (not implemented in this demo)',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Select Time',
          handler: async () => {
            // TODO: Implement datetime picker modal
            // For now, just reschedule to 1 hour later
            const newStart = new Date(new Date(reservation.start_time).getTime() + 60 * 60 * 1000);
            const newEnd = new Date(new Date(reservation.end_time).getTime() + 60 * 60 * 1000);

            try {
              await this.scheduleService.rescheduleReservation(id, newStart, newEnd);
              await this.showUndoToast(reservation, newStart);
            } catch (error) {
              console.error('Failed to reschedule:', error);
              if (error instanceof Error && error.message === 'CONFLICT') {
                this.showErrorToast('Someone else modified this reservation. Please refresh.');
              } else {
                this.showErrorToast('Failed to reschedule');
              }
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async handleCheckIn(id: string) {
    try {
      await this.scheduleService.checkIn(id);
      this.showSuccessToast('Checked in');
    } catch (error) {
      console.error('Failed to check in:', error);
      this.showErrorToast('Failed to check in');
    }
  }

  async handleViewConflict(id: string) {
    const reservation = this.findReservationById(id);
    if (!reservation || !reservation.conflictingIds?.length) return;

    const alert = await this.alertController.create({
      header: '⚠️ Scheduling Conflict',
      message: `This slot overlaps with ${reservation.conflictingIds.length} other reservation(s)`,
      buttons: [
        {
          text: 'View Other Reservation',
          handler: () => {
            // TODO: Navigate to conflicting reservation
          }
        },
        {
          text: 'Close',
          role: 'cancel'
        }
      ]
    });

    await alert.present();
  }

  async onEventChange(event: any) {
    const newEvent = event.detail.value;
    this.selectedEvent = newEvent;

    // Save the preference
    localStorage.setItem('selectedEvent', newEvent);

    // Reload reservations for the new event
    await this.loadReservations();

    // Show feedback
    const eventName = this.getEventName(newEvent);
    this.showSuccessToast(`Switched to ${eventName}'s schedule`);
  }

  getEventName(id: string): string {
    const event = this.events.find(p => p.id === id);
    return event?.name || id;
  }

  get hasNoReservations(): boolean {
    return this.sections.every(section => section.appointments.length === 0);
  }

  private groupReservations(reservations: ReservationViewModel[]): ScheduleSection[] {
    const now = new Date();

    const nextRes = this.findNextReservation(reservations, now);
    const laterToday = this.getLaterTodayReservations(reservations, now, nextRes);
    const tomorrow = this.getTomorrowReservations(reservations, now);
    const upcoming = this.getUpcomingReservations(reservations, now);

    return [
      {
        title: 'Next Up',
        appointments: nextRes ? [nextRes] : [],
        isCollapsible: false
      },
      {
        title: 'Later Today',
        appointments: laterToday,
        isCollapsible: false
      },
      {
        title: 'Tomorrow',
        appointments: tomorrow,
        isCollapsible: true
      },
      {
        title: 'Upcoming',
        appointments: upcoming,
        isCollapsible: true
      }
    ];
  }

  private findNextReservation(reservations: ReservationViewModel[], now: Date): ReservationViewModel | null {
    const upcoming = reservations
      .filter(a => new Date(a.start_time) > now && a.status === 'BOOKED')
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

    return upcoming[0] || null;
  }

  private getLaterTodayReservations(reservations: ReservationViewModel[], now: Date, nextRes: ReservationViewModel | null): ReservationViewModel[] {
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    return reservations
      .filter(a => {
        const start = new Date(a.start_time);
        return start > now &&
          start <= endOfDay &&
          a.id !== nextRes?.id;
      })
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  }

  private getTomorrowReservations(reservations: ReservationViewModel[], now: Date): ReservationViewModel[] {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const endOfTomorrow = new Date(tomorrow);
    endOfTomorrow.setHours(23, 59, 59, 999);

    return reservations
      .filter(a => {
        const start = new Date(a.start_time);
        return start >= tomorrow && start <= endOfTomorrow;
      })
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  }

  private getUpcomingReservations(reservations: ReservationViewModel[], now: Date): ReservationViewModel[] {
    const dayAfterTomorrow = new Date(now);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    dayAfterTomorrow.setHours(0, 0, 0, 0);

    return reservations
      .filter(a => new Date(a.start_time) >= dayAfterTomorrow)
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  }

  private findReservationById(id: string): ReservationViewModel | null {
    for (const section of this.sections) {
      // NOTE: `section.appointments` might still be typed as `any` or `AppointmentViewModel` 
      // if I strictly renamed things in groupReservations but ScheduleSection interface depends on AppointmentViewModel.
      // I need to check ScheduleGroupComponent.
      const found = section.appointments.find((a: any) => a.id === id);
      if (found) return found as ReservationViewModel;
    }
    return null;
  }

  private async showSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color: 'success',
      icon: 'checkmark-circle'
    });
    await toast.present();
  }

  private async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 5000,
      color: 'danger',
      icon: 'alert-circle',
      buttons: [{ text: 'Dismiss', role: 'cancel' }]
    });
    await toast.present();
  }

  private async showUndoToast(original: ReservationViewModel, newTime: Date) {
    const toast = await this.toastController.create({
      message: `Rescheduled to ${newTime.toLocaleTimeString()}`,
      duration: 5000,
      color: 'primary',
      buttons: [
        {
          text: 'Undo',
          handler: async () => {
            try {
              await this.scheduleService.rescheduleReservation(
                original.id,
                new Date(original.start_time),
                new Date(original.end_time)
              );
              this.showSuccessToast('Reverted to original time');
            } catch (error) {
              this.showErrorToast('Failed to undo');
            }
          }
        }
      ]
    });
    await toast.present();
  }
}
