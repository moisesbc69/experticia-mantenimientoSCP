import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { LucideIcons } from '../../../../core/icons';
import { Semaforo, SystemCard } from '../../../../core/models/dashboard.models';
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

  iconFor(system: SystemCard): string {
    const map: Record<string, string> = {
      supresor: 'droplets',
      humectador: 'droplet',
      filtro: 'filter',
    };
    return map[system.kind] ?? 'settings';
  }

  colorFor(state: Semaforo): string {
    const map: Record<Semaforo, string> = {
      verde: '#22c55e',
      ambar: '#f59e0b',
      rojo: '#ef4444',
    };
    return map[state];
  }

  tooltipFor(system: SystemCard): string {
    const parts = [
      `${system.kind_display} · TAG ${system.tag}`,
      `Disponibilidad: ${system.disponibilidad}% (${system.nozzles_operative}/${system.nozzles_installed} boquillas)`,
      `Utilización: ${system.utilizacion}%`,
    ];
    if (system.stop_reason_display) {
      parts.push(`Motivo de detención: ${system.stop_reason_display}`);
    }
    return parts.join('\n');
  }
}
