import { Component, computed, inject } from '@angular/core';
import { ConnectivityService } from '../../services/connectivity.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-sync-indicator',
  imports: [NgClass],
  templateUrl: './sync-indicator.html',
  styleUrl: './sync-indicator.scss',
})
export class SyncIndicator {
  private readonly connectivity = inject(ConnectivityService);

  status = this.connectivity.status;

  label = computed(() => {
    switch (this.status()) {
      case 'online': return 'Sincronizat';
      case 'offline': return 'Offline';
      case 'syncing': return 'Se sincronizează...';
    }
  });

  icon = computed(() => {
    switch (this.status()) {
      case 'online': return 'pi pi-cloud';
      case 'offline': return 'pi pi-cloud-off';
      case 'syncing': return 'pi pi-spin pi-spinner';
    }
  });
}
