import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReservationViewModel } from '../../services/schedule.service';

@Component({
    selector: 'app-event-row',
    templateUrl: './event-row.component.html',
    styleUrls: ['./event-row.component.scss'],
    standalone: true,
    imports: [CommonModule, IonicModule]
})
export class EventRowComponent {
    @Input() reservation!: ReservationViewModel;
    @Input() eventName: string = '';
    @Input() venue: string = '';

    @Output() onCancel = new EventEmitter<string>();
    @Output() onReschedule = new EventEmitter<string>();
    @Output() onCheckIn = new EventEmitter<string>();

    expanded = false;

    get dateOnly(): string {
        return new Date(this.reservation.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    get startTimeOnly(): string {
        return new Date(this.reservation.start_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }

    get timeRange(): string {
        const start = new Date(this.reservation.start_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        const end = new Date(this.reservation.end_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        return `${start} - ${end}`;
    }

    get duration(): string {
        const start = new Date(this.reservation.start_time);
        const end = new Date(this.reservation.end_time);
        const diffMs = end.getTime() - start.getTime();
        const diffMins = Math.round(diffMs / 60000);

        if (diffMins < 60) {
            return `${diffMins} min`;
        }
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        return mins > 0 ? `${hours} hr ${mins} min` : `${hours} hr`;
    }

    get statusIcon(): string {
        switch (this.reservation.status) {
            case 'BOOKED': return 'checkmark-circle';
            case 'CHECKED_IN': return 'person-circle';
            case 'CANCELLED': return 'close-circle';
            default: return 'help-circle';
        }
    }

    get statusColor(): string {
        switch (this.reservation.status) {
            case 'BOOKED': return 'success';
            case 'CHECKED_IN': return 'primary';
            case 'CANCELLED': return 'medium';
            default: return 'medium';
        }
    }

    toggleExpand() {
        this.expanded = !this.expanded;
    }

    handleCancel(event: Event) {
        event.stopPropagation();
        this.onCancel.emit(this.reservation.id);
    }

    handleReschedule(event: Event) {
        event.stopPropagation();
        this.onReschedule.emit(this.reservation.id);
    }
}
