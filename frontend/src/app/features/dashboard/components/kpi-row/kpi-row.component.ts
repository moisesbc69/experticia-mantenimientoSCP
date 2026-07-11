import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';

import { LucideIcons } from '../../../../core/icons';
import { Kpi } from '../../../../core/models/dashboard.models';
import { DetailDrawerService } from '../../../../core/services/detail-drawer.service';

@Component({
  selector: 'app-kpi-row',
  standalone: true,
  imports: [CommonModule, LucideIcons],
  templateUrl: './kpi-row.component.html',
  styleUrl: './kpi-row.component.scss',
})
export class KpiRowComponent {
  @Input() kpis: Kpi[] = [];

  private router = inject(Router);
  private drawer = inject(DetailDrawerService);

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

  /** Cada KPI navega a su vista de detalle (o abre un drawer si no tiene vista). */
  onKpiClick(kpi: Kpi): void {
    switch (kpi.key) {
      case 'pm10_total':
        this.router.navigate(['/polvo']);
        break;
      case 'eficiencia_global':
      case 'sistemas_operativos':
        this.router.navigate(['/sistemas']);
        break;
      case 'estado_general':
        this.router.navigate(['/alertas']);
        break;
      case 'camiones':
        this.drawer.open({
          title: 'Camiones descargados hoy',
          subtitle: 'Descarga de camiones · Chancado Primario',
          badge: { text: 'SIMULADO', color: '#8b949e' },
          rows: [
            { label: 'Camiones hoy', value: kpi.value },
            { label: 'Variación', value: `${kpi.direction === 'up' ? '↑' : '↓'} ${kpi.delta} ${kpi.comparison}`, color: '#22c55e' },
            { label: 'Promedio últimos 7 días', value: '141 camiones/día' },
            { label: 'Hora peak', value: '10:00 – 12:00' },
          ],
          note: 'Dato demo: hoy no se captura en terreno. En producción provendrá del conteo de descargas del cliente.',
        });
        break;
    }
  }
}
