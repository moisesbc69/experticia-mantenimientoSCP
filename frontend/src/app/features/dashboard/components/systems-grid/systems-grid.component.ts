import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';

import { LucideIcons } from '../../../../core/icons';
import { Semaforo, SystemCard } from '../../../../core/models/dashboard.models';
import { DetailDrawerService } from '../../../../core/services/detail-drawer.service';
import { SEMAFORO_COLORS, SEMAFORO_LABELS } from '../../../../core/semaforo';
import { SparklineComponent } from './sparkline.component';

@Component({
  selector: 'app-systems-grid',
  standalone: true,
  imports: [CommonModule, LucideIcons, SparklineComponent],
  templateUrl: './systems-grid.component.html',
  styleUrl: './systems-grid.component.scss',
})
export class SystemsGridComponent {
  @Input() systems: SystemCard[] = [];

  private drawer = inject(DetailDrawerService);

  iconFor(system: SystemCard): string {
    const map: Record<string, string> = {
      supresor: 'droplets',
      humectador: 'droplet',
      filtro: 'filter',
    };
    return map[system.kind] ?? 'settings';
  }

  colorFor(state: Semaforo): string {
    return SEMAFORO_COLORS[state];
  }

  openSystem(system: SystemCard): void {
    this.drawer.open({
      title: system.name,
      subtitle: `${system.kind_display} · Área ${system.area}`,
      badge: {
        text: `${SEMAFORO_LABELS[system.estado_semaforo]} · ${system.disponibilidad}%`,
        color: SEMAFORO_COLORS[system.estado_semaforo],
      },
      rows: [
        { label: 'TAG', value: system.tag },
        { label: 'Boquillas instaladas', value: String(system.nozzles_installed) },
        { label: 'Boquillas operativas', value: String(system.nozzles_operative) },
        { label: 'Boquillas en funcionamiento', value: String(system.nozzles_running) },
        { label: 'Disponibilidad (op/inst)', value: `${system.disponibilidad}%`, color: SEMAFORO_COLORS[system.estado_semaforo] },
        { label: 'Utilización (func/inst)', value: `${system.utilizacion}%` },
        ...(system.stop_reason_display
          ? [{ label: 'Motivo de detención', value: system.stop_reason_display, color: '#f59e0b' }]
          : []),
      ],
      sparks: system.metrics
        .filter((m) => m.sparkline.length)
        .map((m) => ({
          label: m.label,
          values: m.sparkline,
          color: SEMAFORO_COLORS[system.estado_semaforo],
          suffix: m.unit,
        })),
      note: 'Presión, caudal y ΔP son datos simulados de la demo. Disponibilidad y utilización se derivan del catastro real de boquillas.',
    });
  }

  tooltipFor(system: SystemCard): string {
    return `${system.name} — clic para ver detalle`;
  }
}
