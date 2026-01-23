import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AppointmentViewModel } from '../../services/schedule.service';
import { AppointmentCardComponent } from '../appointment-card/appointment-card.component';

export interface ScheduleSection {
    title: string;
    appointments: AppointmentViewModel[];
    isCollapsible: boolean;
}

@Component({
    selector: 'app-schedule-group',
    templateUrl: './schedule-group.component.html',
    styleUrls: ['./schedule-group.component.scss'],
    standalone: true,
    imports: [IonicModule, CommonModule, AppointmentCardComponent]
})
export class ScheduleGroupComponent {
    @Input() section!: ScheduleSection;
    @Input() onCancel!: (id: string) => void;
    @Input() onReschedule!: (id: string) => void;
    @Input() onCheckIn!: (id: string) => void;
    @Input() onViewConflict!: (id: string) => void;
    @Input() getProviderName!: (id: string) => string;

    collapsed: boolean = false;

    toggleCollapse(): void {
        if (this.section.isCollapsible) {
            this.collapsed = !this.collapsed;
        }
    }

    isNextUp(appointment: AppointmentViewModel): boolean {
        return this.section.title === 'Next Up';
    }
}
