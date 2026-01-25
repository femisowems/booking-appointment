import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AppointmentViewModel } from '../../services/schedule.service';

@Component({
    selector: 'app-appointment-card',
    templateUrl: './appointment-card.component.html',
    styleUrls: ['./appointment-card.component.scss'],
    standalone: true,
    imports: [IonicModule, CommonModule]
})
export class AppointmentCardComponent {
    @Input() appointment!: AppointmentViewModel;
    @Input() isNextUp: boolean = false;
    @Input() providerName: string = '';
    @Input() showDate: boolean = false;

    @Output() onCancel = new EventEmitter<string>();
    @Output() onReschedule = new EventEmitter<string>();
    @Output() onCheckIn = new EventEmitter<string>();
    @Output() onViewConflict = new EventEmitter<string>();

    expanded: boolean = false;

    get startTime(): Date {
        return new Date(this.appointment.start_time);
    }

    get endTime(): Date {
        return new Date(this.appointment.end_time);
    }

    // Format time in user's local timezone
    get localStartTime(): string {
        return this.startTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    get localEndTime(): string {
        return this.endTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    get localDate(): string {
        return this.startTime.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    get localDateShort(): string {
        return this.startTime.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    }


    get statusColor(): string {
        switch (this.appointment.status) {
            case 'BOOKED': return 'success';
            case 'CANCELLED': return 'danger';
            case 'CANCELLING': return 'medium';
            case 'RESCHEDULING': return 'warning';
            case 'COMPLETED': return 'tertiary';
            case 'CHECKED_IN': return 'primary';
            default: return 'medium';
        }
    }

    get statusIcon(): string {
        switch (this.appointment.status) {
            case 'BOOKED': return 'checkmark-circle';
            case 'CANCELLED': return 'close-circle';
            case 'CANCELLING': return 'hourglass';
            case 'RESCHEDULING': return 'time';
            case 'COMPLETED': return 'checkmark-done';
            case 'CHECKED_IN': return 'person-circle';
            default: return 'help-circle';
        }
    }

    get confirmationStateIcon(): string {
        switch (this.appointment.confirmationState) {
            case 'CONFIRMED': return 'checkmark-circle';
            case 'PENDING': return 'sync';
            case 'FAILED': return 'alert-circle';
            default: return 'help-circle';
        }
    }

    get confirmationStateColor(): string {
        switch (this.appointment.confirmationState) {
            case 'CONFIRMED': return 'success';
            case 'PENDING': return 'warning';
            case 'FAILED': return 'danger';
            default: return 'medium';
        }
    }

    get showCheckIn(): boolean {
        const now = new Date();
        const diff = this.startTime.getTime() - now.getTime();
        const minutesUntil = diff / (1000 * 60);
        return minutesUntil >= -15 && minutesUntil <= 30 && this.appointment.status === 'BOOKED';
    }

    get timeUntilStart(): string {
        const now = new Date();
        const diff = this.startTime.getTime() - now.getTime();
        const minutesUntil = Math.floor(diff / (1000 * 60));

        if (minutesUntil < 0) {
            return 'Started';
        } else if (minutesUntil < 60) {
            return `Starting in ${minutesUntil}m`;
        } else {
            const hours = Math.floor(minutesUntil / 60);
            return `Starting in ${hours}h`;
        }
    }

    toggleExpanded(): void {
        this.expanded = !this.expanded;
    }

    handleCancel(): void {
        this.onCancel.emit(this.appointment.id);
    }

    handleReschedule(): void {
        this.onReschedule.emit(this.appointment.id);
    }

    handleCheckIn(): void {
        this.onCheckIn.emit(this.appointment.id);
    }

    handleViewConflict(): void {
        this.onViewConflict.emit(this.appointment.id);
    }
}
