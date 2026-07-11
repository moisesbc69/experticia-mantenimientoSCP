import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { LucideIcons } from '../../core/icons';
import { DashboardStateService } from '../../core/services/dashboard-state.service';
import { ToastService } from '../../core/services/toast.service';

interface ReportDef {
  key: string;
  icon: string;
  title: string;
  description: string;
  simulated: boolean;
}

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, LucideIcons],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.scss',
})
export class ReportesComponent {
  readonly state = inject(DashboardStateService);
  private toast = inject(ToastService);

  readonly reports: ReportDef[] = [
    {
      key: 'sistemas',
      icon: 'settings',
      title: 'Estado de sistemas',
      description: 'Disponibilidad, utilización, boquillas y motivos de detención por sistema.',
      simulated: false,
    },
    {
      key: 'alertas',
      icon: 'bell',
      title: 'Alertas activas',
      description: 'Listado completo de alertas con severidad, sistema y fecha/hora.',
      simulated: false,
    },
    {
      key: 'pm10',
      icon: 'cloud-fog',
      title: 'Emisión PM10 por punto',
      description: 'Emisión de material particulado en cada punto de monitoreo del flujo.',
      simulated: true,
    },
  ];

  download(report: ReportDef): void {
    const data = this.state.data();
    if (!data) {
      return;
    }
    let rows: string[][] = [];
    if (report.key === 'sistemas') {
      rows = [
        ['Sistema', 'TAG', 'Área', 'Tipo', 'Boquillas instaladas', 'Operativas', 'En funcionamiento',
         'Disponibilidad %', 'Utilización %', 'Estado', 'Motivo detención'],
        ...data.systems.map((s) => [
          s.name, s.tag, s.area, s.kind_display, String(s.nozzles_installed),
          String(s.nozzles_operative), String(s.nozzles_running),
          String(s.disponibilidad), String(s.utilizacion), s.estado_semaforo,
          s.stop_reason_display ?? '',
        ]),
      ];
    } else if (report.key === 'alertas') {
      rows = [
        ['Severidad', 'Mensaje', 'Sistema', 'Fecha/hora'],
        ...data.alerts.items.map((a) => [a.severity_display, a.message, a.system ?? '', a.timestamp]),
      ];
    } else {
      rows = [
        ['Orden', 'Punto de proceso', 'Área', 'PM10 (µg/m³N)', 'Sensor', 'Dato'],
        ...data.process_points.map((p) => [
          String(p.order), p.name, p.area, String(p.pm10 ?? ''),
          p.has_sensor ? 'Sí' : 'No', p.simulated_pm10 ? 'SIMULADO' : 'REAL',
        ]),
      ];
    }

    const csv = rows
      .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(';'))
      .join('\n');
    const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `experticia_${report.key}_${date}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    this.toast.show('Reporte CSV descargado');
  }
}
