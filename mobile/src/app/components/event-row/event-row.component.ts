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

    @Output() onCancel = new EventEmitter<string>();
    @Output() onReschedule = new EventEmitter<string>();
    @Output() onCheckIn = new EventEmitter<string>();

    expanded = false;

    get startTimeOnly(): string {
        return new Date(this.reservation.start_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
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
