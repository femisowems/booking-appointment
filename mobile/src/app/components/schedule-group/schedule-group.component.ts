import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReservationViewModel } from '../../services/schedule.service';
import { EventRowComponent } from '../event-row/event-row.component';
import { PriorityEventCardComponent } from '../priority-event-card/priority-event-card.component';
// import { ReservationCardComponent } from '../reservation-card/reservation-card.component'; // Legacy

export interface ScheduleSection {
    title: string;
    appointments: ReservationViewModel[];
    isCollapsible: boolean;
}

@Component({
    selector: 'app-schedule-group',
    templateUrl: './schedule-group.component.html',
    styleUrls: ['./schedule-group.component.scss'],
    standalone: true,
    imports: [CommonModule, IonicModule, EventRowComponent, PriorityEventCardComponent]
})
export class ScheduleGroupComponent {
    @Input() section!: ScheduleSection; // Need to update template to use `section.reservations`
    @Input() onCancel!: (id: string) => void;
    @Input() onReschedule!: (id: string) => void;
    @Input() onCheckIn!: (id: string) => void;
    @Input() onViewConflict!: (id: string) => void;
    @Input() getEventName!: (id: string) => string;
    @Input() getEventVenue!: (id: string) => string;

    collapsed: boolean = false;

    toggleCollapse(): void {
        if (this.section.isCollapsible) {
            this.collapsed = !this.collapsed;
        }
    }

    isNextUp(reservation: ReservationViewModel): boolean {
        return this.section.title === 'Next Up';
    }
}
