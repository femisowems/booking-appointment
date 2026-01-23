import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ModalController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ScheduleService, AppointmentViewModel, SyncState } from '../services/schedule.service';
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
  selectedProvider: string = 'provider-1';
  currentTime: Date = new Date();
  private clockInterval?: number;

  // Available providers
  providers = [
    { id: 'provider-1', name: 'Dr. Smith' },
    { id: 'provider-2', name: 'Dr. Jones' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private scheduleService: ScheduleService,
    private alertController: AlertController,
    private modalController: ModalController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    // Load saved provider preference
    const savedProvider = localStorage.getItem('selectedProvider');
    if (savedProvider && this.providers.some(p => p.id === savedProvider)) {
      this.selectedProvider = savedProvider;
    }

    // Subscribe to appointments
    this.scheduleService.getAppointments()
      .pipe(takeUntil(this.destroy$))
      .subscribe(appointments => {
        this.sections = this.groupAppointments(appointments);
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
    this.loadAppointments();

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


  async loadAppointments() {
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
      await this.scheduleService.refresh(this.selectedProvider, start, end);
    } catch (error) {
      console.error('Failed to load appointments:', error);
      this.showErrorToast('Failed to load appointments');
    }
  }

  async handleCancel(id: string) {
    const appointment = this.findAppointmentById(id);
    if (!appointment) return;

    const alert = await this.alertController.create({
      header: 'Cancel Appointment?',
      message: `
        <strong>Patient:</strong> ${appointment.user_id}<br>
        <strong>Time:</strong> ${new Date(appointment.start_time).toLocaleString()}<br><br>
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
              await this.scheduleService.cancelAppointment(id);
              this.showSuccessToast('Appointment cancelled');
            } catch (error) {
              console.error('Failed to cancel:', error);
              this.showErrorToast('Failed to cancel appointment');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async handleReschedule(id: string) {
    const appointment = this.findAppointmentById(id);
    if (!appointment) return;

    const alert = await this.alertController.create({
      header: 'Reschedule Appointment',
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
            const newStart = new Date(new Date(appointment.start_time).getTime() + 60 * 60 * 1000);
            const newEnd = new Date(new Date(appointment.end_time).getTime() + 60 * 60 * 1000);

            try {
              await this.scheduleService.rescheduleAppointment(id, newStart, newEnd);
              await this.showUndoToast(appointment, newStart);
            } catch (error) {
              console.error('Failed to reschedule:', error);
              if (error instanceof Error && error.message === 'CONFLICT') {
                this.showErrorToast('Someone else modified this appointment. Please refresh.');
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
      this.showSuccessToast('Patient checked in');
    } catch (error) {
      console.error('Failed to check in:', error);
      this.showErrorToast('Failed to check in');
    }
  }

  async handleViewConflict(id: string) {
    const appointment = this.findAppointmentById(id);
    if (!appointment || !appointment.conflictingIds?.length) return;

    const alert = await this.alertController.create({
      header: '⚠️ Scheduling Conflict',
      message: `This slot overlaps with ${appointment.conflictingIds.length} other appointment(s)`,
      buttons: [
        {
          text: 'View Other Appointment',
          handler: () => {
            // TODO: Navigate to conflicting appointment
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

  async onProviderChange(event: any) {
    const newProvider = event.detail.value;
    this.selectedProvider = newProvider;

    // Save the preference
    localStorage.setItem('selectedProvider', newProvider);

    // Reload appointments for the new provider
    await this.loadAppointments();

    // Show feedback
    const providerName = this.getProviderName(newProvider);
    this.showSuccessToast(`Switched to ${providerName}'s schedule`);
  }

  getProviderName(id: string): string {
    const provider = this.providers.find(p => p.id === id);
    return provider?.name || id;
  }

  get hasNoAppointments(): boolean {
    return this.sections.every(section => section.appointments.length === 0);
  }

  private groupAppointments(appointments: AppointmentViewModel[]): ScheduleSection[] {
    const now = new Date();

    const nextAppt = this.findNextAppointment(appointments, now);
    const laterToday = this.getLaterTodayAppointments(appointments, now, nextAppt);
    const tomorrow = this.getTomorrowAppointments(appointments, now);
    const upcoming = this.getUpcomingAppointments(appointments, now);

    return [
      {
        title: 'Next Up',
        appointments: nextAppt ? [nextAppt] : [],
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

  private findNextAppointment(appointments: AppointmentViewModel[], now: Date): AppointmentViewModel | null {
    const upcoming = appointments
      .filter(a => new Date(a.start_time) > now && a.status === 'BOOKED')
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

    return upcoming[0] || null;
  }

  private getLaterTodayAppointments(appointments: AppointmentViewModel[], now: Date, nextAppt: AppointmentViewModel | null): AppointmentViewModel[] {
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    return appointments
      .filter(a => {
        const start = new Date(a.start_time);
        return start > now &&
          start <= endOfDay &&
          a.id !== nextAppt?.id;
      })
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  }

  private getTomorrowAppointments(appointments: AppointmentViewModel[], now: Date): AppointmentViewModel[] {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const endOfTomorrow = new Date(tomorrow);
    endOfTomorrow.setHours(23, 59, 59, 999);

    return appointments
      .filter(a => {
        const start = new Date(a.start_time);
        return start >= tomorrow && start <= endOfTomorrow;
      })
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  }

  private getUpcomingAppointments(appointments: AppointmentViewModel[], now: Date): AppointmentViewModel[] {
    const dayAfterTomorrow = new Date(now);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    dayAfterTomorrow.setHours(0, 0, 0, 0);

    return appointments
      .filter(a => new Date(a.start_time) >= dayAfterTomorrow)
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  }

  private findAppointmentById(id: string): AppointmentViewModel | null {
    for (const section of this.sections) {
      const found = section.appointments.find(a => a.id === id);
      if (found) return found;
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

  private async showUndoToast(original: AppointmentViewModel, newTime: Date) {
    const toast = await this.toastController.create({
      message: `Rescheduled to ${newTime.toLocaleTimeString()}`,
      duration: 5000,
      color: 'primary',
      buttons: [
        {
          text: 'Undo',
          handler: async () => {
            try {
              await this.scheduleService.rescheduleAppointment(
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
