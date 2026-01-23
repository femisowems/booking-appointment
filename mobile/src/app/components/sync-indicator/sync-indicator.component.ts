import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SyncState } from '../../services/schedule.service';

@Component({
    selector: 'app-sync-indicator',
    templateUrl: './sync-indicator.component.html',
    styleUrls: ['./sync-indicator.component.scss'],
    standalone: true,
    imports: [IonicModule, CommonModule]
})
export class SyncIndicatorComponent {
    @Input() syncState: SyncState = 'SYNCED';
    @Input() lastSyncTime: Date | null = null;

    get icon(): string {
        switch (this.syncState) {
            case 'SYNCED': return 'checkmark-circle';
            case 'SYNCING': return 'sync';
            case 'OFFLINE': return 'cloud-offline';
            case 'ERROR': return 'alert-circle';
            default: return 'help-circle';
        }
    }

    get color(): string {
        switch (this.syncState) {
            case 'SYNCED': return 'success';
            case 'SYNCING': return 'primary';
            case 'OFFLINE': return 'medium';
            case 'ERROR': return 'danger';
            default: return 'medium';
        }
    }

    get label(): string {
        switch (this.syncState) {
            case 'SYNCED': return this.getTimeSinceSync();
            case 'SYNCING': return 'Syncing...';
            case 'OFFLINE': return 'Offline';
            case 'ERROR': return 'Sync failed';
            default: return 'Unknown';
        }
    }

    get isSpinning(): boolean {
        return this.syncState === 'SYNCING';
    }

    private getTimeSinceSync(): string {
        if (!this.lastSyncTime) {
            return 'Never synced';
        }

        const now = new Date();
        const diff = now.getTime() - this.lastSyncTime.getTime();
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (seconds < 30) {
            return 'Just now';
        } else if (seconds < 60) {
            return `${seconds}s ago`;
        } else if (minutes < 60) {
            return `${minutes}m ago`;
        } else {
            return `${hours}h ago`;
        }
    }
}
