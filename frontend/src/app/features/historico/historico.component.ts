import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';

import { LucideIcons } from '../../core/icons';
import { DashboardStateService } from '../../core/services/dashboard-state.service';

const SEV_COLORS: Record<string, string> = {
  critica: '#ef4444',
  mayor: '#f59e0b',
  menor: '#3b82f6',
};

@Component({
  selector: 'app-historico',
  standalone: true,
  imports: [CommonModule, LucideIcons, NgxChartsModule],
  templateUrl: './historico.component.html',
  styleUrl: './historico.component.scss',
})
export class HistoricoComponent {
  readonly state = inject(DashboardStateService);
  readonly range = signal<'7d' | '30d'>('30d');

  readonly colorScheme: Color = {
    name: 'hist',
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
      { name: 'Periodo anterior', series: build(active.previous) },
    ];
  });

  readonly events = computed(() => {
    const items = [...(this.state.data()?.alerts?.items ?? [])];
    return items.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  });

  sevColor(severity: string): string {
    return SEV_COLORS[severity] ?? '#8b949e';
  }
}
