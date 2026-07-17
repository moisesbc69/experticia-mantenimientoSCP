import { Injectable, signal } from '@angular/core';

/**
 * Estado de layout compartido. Controla el menú lateral (sidebar) en móvil,
 * donde se comporta como un cajón deslizable (off-canvas).
 */
@Injectable({ providedIn: 'root' })
export class LayoutService {
  readonly sidebarOpen = signal(false);

  toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }
}
