import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { LucideIcons } from '../../../../core/icons';
import { Kpi } from '../../../../core/models/dashboard.models';

@Component({
  selector: 'app-kpi-row',
  standalone: true,
  imports: [CommonModule, LucideIcons],
  templateUrl: './kpi-row.component.html',
  styleUrl: './kpi-row.component.scss',
})
export class KpiRowComponent {
  @Input() kpis: Kpi[] = [];

  iconFor(kpi: Kpi): string {
    const map: Record<string, string> = {
      pm10_total: 'wind',
      eficiencia_global: 'gauge',
      sistemas_operativos: 'settings',
      camiones: 'truck',
      estado_general: 'circle-check',
    };
    return map[kpi.key] ?? 'activity';
  }

  isStatusCard(kpi: Kpi): boolean {
    return kpi.key === 'estado_general';
  }

  statusOk(kpi: Kpi): boolean {
    return kpi.value.toLowerCase().includes('normal');
  }
}
