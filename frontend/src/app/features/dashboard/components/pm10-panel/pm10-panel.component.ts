import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, signal } from '@angular/core';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';

import { Kpi, Pm10Range, Pm10Series } from '../../../../core/models/dashboard.models';

interface ChartSeries {
  name: string;
  series: { name: string; value: number }[];
}

@Component({
  selector: 'app-pm10-panel',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  templateUrl: './pm10-panel.component.html',
  styleUrl: './pm10-panel.component.scss',
})
export class Pm10PanelComponent implements OnChanges {
  @Input() series: Pm10Series[] = [];
  @Input() kpi: Kpi | null = null;

  readonly range = signal<Pm10Range>('hoy');
  readonly chartData = signal<ChartSeries[]>([]);

  readonly tabs: { key: Pm10Range; label: string }[] = [
    { key: 'hoy', label: 'Hoy' },
    { key: '7d', label: '7 días' },
    { key: '30d', label: '30 días' },
  ];

  readonly colorScheme: Color = {
    name: 'pm10',
    selectable: false,
    group: ScaleType.Ordinal,
    domain: ['#3b82f6', '#8b949e'],
  };

  ngOnChanges(): void {
    this.buildChart();
  }

  setRange(range: Pm10Range): void {
    this.range.set(range);
    this.buildChart();
  }

  comparisonLabel(): string {
    return this.range() === 'hoy' ? 'Ayer' : 'Periodo anterior';
  }

  private buildChart(): void {
    const active = this.series.find((s) => s.range === this.range());
    if (!active) {
      this.chartData.set([]);
      return;
    }
    const toSeries = (values: number[]) =>
      values.map((value, i) => ({ name: active.labels[i] ?? String(i), value }));
    this.chartData.set([
      { name: 'Promedio planta', series: toSeries(active.current) },
      { name: this.comparisonLabel(), series: toSeries(active.previous) },
    ]);
  }
}
