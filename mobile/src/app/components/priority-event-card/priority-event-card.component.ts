import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReservationViewModel } from '../../services/schedule.service';

@Component({
    selector: 'app-priority-event-card',
    templateUrl: './priority-event-card.component.html',
    styleUrls: ['./priority-event-card.component.scss'],
    standalone: true,
    imports: [CommonModule, IonicModule]
})
export class PriorityEventCardComponent implements OnInit, OnDestroy {
    @Input() reservation!: ReservationViewModel;
    @Input() eventName: string = '';

    @Output() onCheckIn = new EventEmitter<string>();

    timeLeft: string = '';
    private timer: any;

    ngOnInit() {
        this.updateTimer();
        this.timer = setInterval(() => this.updateTimer(), 60000);
    }

    ngOnDestroy() {
        if (this.timer) clearInterval(this.timer);
    }

    updateTimer() {
        const start = new Date(this.reservation.start_time).getTime();
        const now = new Date().getTime();
        const diff = start - now;

        if (diff <= 0) {
            this.timeLeft = 'Now';
        } else {
            const minutes = Math.floor(diff / 60000);
            if (minutes < 60) {
                this.timeLeft = `Starts in ${minutes} min`;
            } else {
                const hours = Math.floor(minutes / 60);
                this.timeLeft = `Starts in ${hours}h ${minutes % 60}m`;
            }
        }
    }

    handleCheckIn() {
        this.onCheckIn.emit(this.reservation.id);
    }
}
