import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';

import { LucideIcons } from '../../core/icons';
import { Pm10Range, ProcessPoint } from '../../core/models/dashboard.models';
import { DashboardStateService } from '../../core/services/dashboard-state.service';
import { DetailDrawerService } from '../../core/services/detail-drawer.service';
import { PM10_LEVEL_COLORS, findSystemForPoint, pm10Level } from '../../core/semaforo';
import { pointDrawer } from '../../shared/drawer-builders';

@Component({
  selector: 'app-polvo',
  standalone: true,
  imports: [CommonModule, LucideIcons, NgxChartsModule],
  templateUrl: './polvo.component.html',
  styleUrl: './polvo.component.scss',
})
export class PolvoComponent {
  readonly state = inject(DashboardStateService);
  private drawer = inject(DetailDrawerService);

  readonly range = signal<Pm10Range>('hoy');
  readonly tabs: { key: Pm10Range; label: string }[] = [
    { key: 'hoy', label: 'Hoy' },
    { key: '7d', label: '7 días' },
    { key: '30d', label: '30 días' },
  ];

  readonly colorScheme: Color = {
    name: 'pm10-full',
    selectable: false,
    group: ScaleType.Ordinal,
    domain: ['#3b82f6', '#8b949e'],
  };

  readonly chartData = computed(() => {
    const series = this.state.data()?.pm10_series ?? [];
    const active = series.find((s) => s.range === this.range());
    if (!active) {
      return [];
    }
    const build = (values: number[]) =>
      values.map((value, i) => ({ name: active.labels[i] ?? String(i), value }));
    return [
      { name: 'Promedio planta', series: build(active.current) },
      { name: this.range() === 'hoy' ? 'Ayer' : 'Periodo anterior', series: build(active.previous) },
    ];
  });

  readonly sortedPoints = computed(() => {
    const points = [...(this.state.data()?.process_points ?? [])];
    return points.sort((a, b) => (b.pm10 ?? 0) - (a.pm10 ?? 0));
  });

  readonly maxPm10 = computed(() =>
    Math.max(1, ...this.sortedPoints().map((p) => p.pm10 ?? 0)),
  );

  barColor(point: ProcessPoint): string {
    return PM10_LEVEL_COLORS[pm10Level(point.pm10)];
  }

  barWidth(point: ProcessPoint): string {
    return `${(100 * (point.pm10 ?? 0)) / this.maxPm10()}%`;
  }

  open(point: ProcessPoint): void {
    const system = findSystemForPoint(point, this.state.data()?.systems ?? []);
    this.drawer.open(pointDrawer(point, system));
  }
}
