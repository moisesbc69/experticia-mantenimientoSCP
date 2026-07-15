import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';

import { LucideIcons } from '../../core/icons';
import { WorkOrder } from '../../core/models/dashboard.models';
import { DashboardStateService } from '../../core/services/dashboard-state.service';
import { DetailDrawerService } from '../../core/services/detail-drawer.service';
import { WO_KIND_COLORS, WO_STATUS_COLORS, workOrderDrawer } from '../../shared/drawer-builders';

type StatusFilter = 'todas' | WorkOrder['status'];

@Component({
  selector: 'app-ots',
  standalone: true,
  imports: [CommonModule, LucideIcons],
  templateUrl: './ots.component.html',
  styleUrl: './ots.component.scss',
})
export class OtsComponent {
  readonly state = inject(DashboardStateService);
  private drawer = inject(DetailDrawerService);

  readonly filter = signal<StatusFilter>('todas');

  readonly filters: { key: StatusFilter; label: string }[] = [
    { key: 'todas', label: 'Todas' },
    { key: 'abierta', label: 'Abiertas' },
    { key: 'en_ejecucion', label: 'En ejecución' },
    { key: 'cerrada', label: 'Cerradas' },
  ];

  readonly orders = computed<WorkOrder[]>(() => this.state.data()?.work_orders ?? []);

  readonly filtered = computed<WorkOrder[]>(() =>
    this.filter() === 'todas'
      ? this.orders()
      : this.orders().filter((o) => o.status === this.filter()),
  );

  count(key: StatusFilter): number {
    return key === 'todas'
      ? this.orders().length
      : this.orders().filter((o) => o.status === key).length;
  }

  statusColor(status: WorkOrder['status']): string {
    return WO_STATUS_COLORS[status];
  }

  kindColor(kind: WorkOrder['kind']): string {
    return WO_KIND_COLORS[kind];
  }

  open(order: WorkOrder): void {
    this.drawer.open(workOrderDrawer(order));
  }

  formatTime(iso: string): string {
    const date = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(date.getHours())}:${pad(date.getMinutes())} h`;
  }
}
