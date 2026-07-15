import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';

import { LucideIcons } from '../../core/icons';
import { AlertItem, ProcessPoint, SystemCard, SystemMetric, WorkOrder } from '../../core/models/dashboard.models';
import { DashboardStateService } from '../../core/services/dashboard-state.service';
import { DetailDrawerService } from '../../core/services/detail-drawer.service';
import { PM10_LEVEL_COLORS, SEMAFORO_COLORS, SEMAFORO_LABELS, findSystemForPoint, pm10Level } from '../../core/semaforo';
import { WO_KIND_COLORS, WO_STATUS_COLORS, workOrderDrawer } from '../../shared/drawer-builders';
import { SparklineComponent } from '../dashboard/components/systems-grid/sparkline.component';

const SEV_COLORS: Record<string, string> = {
  critica: '#ef4444',
  mayor: '#f59e0b',
  menor: '#3b82f6',
};

/** Escala del termómetro PM10 (µg/m³N): umbral de alerta y tope visual. */
const PM10_ALERT = 250;
const PM10_SCALE_MAX = 420;

@Component({
  selector: 'app-flujo',
  standalone: true,
  imports: [CommonModule, LucideIcons, SparklineComponent],
  templateUrl: './flujo.component.html',
  styleUrl: './flujo.component.scss',
})
export class FlujoComponent {
  readonly state = inject(DashboardStateService);
  private drawer = inject(DetailDrawerService);

  readonly selectedId = signal<number | null>(null);

  readonly points = computed<ProcessPoint[]>(() => this.state.data()?.process_points ?? []);

  /** Punto seleccionado; por defecto (o al cambiar de planta) el de mayor PM10. */
  readonly selected = computed<ProcessPoint | null>(() => {
    const points = this.points();
    if (!points.length) {
      return null;
    }
    const found = points.find((p) => p.id === this.selectedId());
    return found ?? points.reduce((max, p) => ((p.pm10 ?? 0) > (max.pm10 ?? 0) ? p : max), points[0]);
  });

  readonly system = computed<SystemCard | null>(() => {
    const point = this.selected();
    if (!point) {
      return null;
    }
    return this.systemFor(point) ?? null;
  });

  readonly systemOrders = computed<WorkOrder[]>(() => {
    const system = this.system();
    if (!system) {
      return [];
    }
    return (this.state.data()?.work_orders ?? []).filter((o) => o.system_id === system.id);
  });

  readonly systemAlerts = computed<AlertItem[]>(() => {
    const system = this.system();
    if (!system) {
      return [];
    }
    return (this.state.data()?.alerts?.items ?? []).filter((a) => a.system === system.name);
  });

  readonly isHottest = computed(() => {
    const point = this.selected();
    const max = Math.max(...this.points().map((p) => p.pm10 ?? 0));
    return !!point && (point.pm10 ?? 0) === max;
  });

  select(point: ProcessPoint): void {
    this.selectedId.set(point.id);
  }

  systemFor(point: ProcessPoint): SystemCard | undefined {
    return findSystemForPoint(point, this.state.data()?.systems ?? []);
  }

  // ---- helpers de presentación ----
  pmColor(value: number | null): string {
    return PM10_LEVEL_COLORS[pm10Level(value)];
  }

  semColor(system: SystemCard): string {
    return SEMAFORO_COLORS[system.estado_semaforo];
  }

  semLabel(system: SystemCard): string {
    return SEMAFORO_LABELS[system.estado_semaforo];
  }

  runningPct(system: SystemCard): number {
    return system.nozzles_installed ? (100 * system.nozzles_running) / system.nozzles_installed : 0;
  }

  idlePct(system: SystemCard): number {
    return system.nozzles_installed
      ? (100 * (system.nozzles_operative - system.nozzles_running)) / system.nozzles_installed
      : 0;
  }

  pmMarkerPct(value: number | null): number {
    return Math.min(100, (100 * (value ?? 0)) / PM10_SCALE_MAX);
  }

  readonly pmAlert = PM10_ALERT;
  readonly pmScaleMax = PM10_SCALE_MAX;

  sparkMetrics(system: SystemCard): SystemMetric[] {
    return system.metrics.filter((m) => m.sparkline.length);
  }

  woStatusColor(status: WorkOrder['status']): string {
    return WO_STATUS_COLORS[status];
  }

  woKindColor(kind: WorkOrder['kind']): string {
    return WO_KIND_COLORS[kind];
  }

  sevColor(severity: string): string {
    return SEV_COLORS[severity] ?? '#8b949e';
  }

  openOrder(order: WorkOrder): void {
    this.drawer.open(workOrderDrawer(order));
  }

  formatTime(iso: string): string {
    const date = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(date.getHours())}:${pad(date.getMinutes())} h`;
  }
}
