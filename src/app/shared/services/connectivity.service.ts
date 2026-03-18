import { DestroyRef, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Database } from '@angular/fire/database';
import { ref, onValue } from 'firebase/database';

export type SyncStatus = 'online' | 'offline' | 'syncing';

@Injectable({ providedIn: 'root' })
export class ConnectivityService {
  private readonly db = inject(Database);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  /** Current connection status to Firebase */
  readonly status = signal<SyncStatus>('online');

  /** Whether the device has internet (browser API) */
  readonly deviceOnline = signal(true);

  /** Timestamp of last successful sync */
  readonly lastSyncTime = signal<Date | null>(null);

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;

    // Monitor Firebase RTDB connection via .info/connected
    const connectedRef = ref(this.db, '.info/connected');
    onValue(connectedRef, (snap) => {
      const connected = snap.val() === true;
      this.status.set(connected ? 'online' : 'offline');
      if (connected) {
        this.lastSyncTime.set(new Date());
      }
    });

    // Monitor browser online/offline events
    this.deviceOnline.set(navigator.onLine);

    globalThis.addEventListener('online', () => {
      this.deviceOnline.set(true);
    });

    globalThis.addEventListener('offline', () => {
      this.deviceOnline.set(false);
      this.status.set('offline');
    });
  }
}
