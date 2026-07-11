import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';

import { LucideIcons } from '../../../../core/icons';
import { ProcessPoint, SystemCard } from '../../../../core/models/dashboard.models';
import { ToastService } from '../../../../core/services/toast.service';

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

  decorative(): void {
    this.toast.show('Próximamente');
  }

  pm10Level(value: number | null): 'low' | 'mid' | 'high' {
    if (value === null) {
      return 'low';
    }
    if (value >= 250) {
      return 'high';
    }
    if (value >= 150) {
      return 'mid';
    }
    return 'low';
  }

  /** Sistema asociado al punto (para el tooltip: estado y motivo de detención). */
  systemFor(point: ProcessPoint): SystemCard | undefined {
    return this.systems.find(
      (s) => s.name.toLowerCase().slice(0, 8) === point.name.toLowerCase().slice(0, 8),
    );
  }

  tooltipFor(point: ProcessPoint): string {
    const system = this.systemFor(point);
    const parts = [`${String(point.order).padStart(2, '0')} · ${point.name}`];
    if (point.pm10 !== null) {
      parts.push(`PM10: ${point.pm10} µg/m³N (simulado)`);
    }
    if (system) {
      parts.push(`Sistema: ${system.name} — ${system.indicator_label} ${system.disponibilidad}%`);
      if (system.stop_reason_display) {
        parts.push(`Motivo: ${system.stop_reason_display}`);
      }
    }
    return parts.join('\n');
  }
}
