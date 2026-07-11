import { CommonModule } from '@angular/common';
import { Component, Input, inject, signal } from '@angular/core';

import { LucideIcons } from '../../../../core/icons';
import { ProcessPoint, SystemCard } from '../../../../core/models/dashboard.models';
import { DetailDrawerService } from '../../../../core/services/detail-drawer.service';
import { ToastService } from '../../../../core/services/toast.service';
import { PM10_LEVEL_COLORS, SEMAFORO_COLORS, SEMAFORO_LABELS, pm10Level } from '../../../../core/semaforo';

@Component({
  selector: 'app-process-flow',
  standalone: true,
  imports: [CommonModule, LucideIcons],
  templateUrl: './process-flow.component.html',
  styleUrl: './process-flow.component.scss',
})
export class ProcessFlowComponent {
  @Input() points: ProcessPoint[] = [];
  @Input() systems: SystemCard[] = [];

  private toast = inject(ToastService);
  private drawer = inject(DetailDrawerService);

  // Capas del diagrama (funcionales)
  readonly layersOpen = signal(false);
  readonly showPm10 = signal(true);
  readonly showSuppression = signal(true);
  readonly showSensors = signal(true);

  toggleLayers(): void {
    this.layersOpen.update((open) => !open);
  }

  decorative(): void {
    this.toast.show('Próximamente');
  }

  pm10Level = pm10Level;

  /** Sistema asociado al punto (para detalle y tooltip). */
  systemFor(point: ProcessPoint): SystemCard | undefined {
    return this.systems.find(
      (s) => s.name.toLowerCase().slice(0, 8) === point.name.toLowerCase().slice(0, 8),
    );
  }

  openPoint(point: ProcessPoint): void {
    const system = this.systemFor(point);
    const level = pm10Level(point.pm10);
    this.drawer.open({
      title: `${String(point.order).padStart(2, '0')} · ${point.name}`,
      subtitle: `Punto de proceso · Área ${point.area}`,
      badge: point.pm10 !== null
        ? { text: `PM10 ${point.pm10} µg/m³N`, color: PM10_LEVEL_COLORS[level] }
        : undefined,
      rows: [
        { label: 'Sensor de polvo', value: point.has_sensor ? 'Instalado · en línea' : 'Sin sensor', color: point.has_sensor ? '#22c55e' : '#8b949e' },
        ...(system
          ? [
              { label: 'Sistema asociado', value: `${system.name} (${system.kind_display})` },
              { label: 'TAG', value: system.tag },
              { label: 'Disponibilidad', value: `${system.disponibilidad}% (${system.nozzles_operative}/${system.nozzles_installed} boquillas)`, color: SEMAFORO_COLORS[system.estado_semaforo] },
              { label: 'Utilización', value: `${system.utilizacion}%` },
              { label: 'Estado', value: SEMAFORO_LABELS[system.estado_semaforo], color: SEMAFORO_COLORS[system.estado_semaforo] },
              ...(system.stop_reason_display
                ? [{ label: 'Motivo de detención', value: system.stop_reason_display, color: '#f59e0b' }]
                : []),
            ]
          : [{ label: 'Sistema asociado', value: '—' }]),
      ],
      sparks: system?.metrics
        .filter((m) => m.sparkline.length)
        .map((m) => ({
          label: m.label,
          values: m.sparkline,
          color: SEMAFORO_COLORS[system.estado_semaforo],
          suffix: m.unit,
        })),
      note: 'La emisión PM10 es un dato simulado de la demo (hoy no se captura en terreno).',
    });
  }

  tooltipFor(point: ProcessPoint): string {
    return `${point.name} — clic para ver detalle`;
  }
}
