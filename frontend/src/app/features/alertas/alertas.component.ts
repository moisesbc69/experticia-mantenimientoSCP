import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';

import { LucideIcons } from '../../core/icons';
import { AlertItem } from '../../core/models/dashboard.models';
import { DashboardStateService } from '../../core/services/dashboard-state.service';

type SevFilter = 'todas' | 'critica' | 'mayor' | 'menor';

const SEV_COLORS: Record<string, string> = {
  critica: '#ef4444',
  mayor: '#f59e0b',
  menor: '#3b82f6',
};

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [CommonModule, LucideIcons],
  templateUrl: './alertas.component.html',
  styleUrl: './alertas.component.scss',
})
export class AlertasComponent {
  readonly state = inject(DashboardStateService);
  readonly filter = signal<SevFilter>('todas');

  readonly filters: { key: SevFilter; label: string }[] = [
    { key: 'todas', label: 'Todas' },
    { key: 'critica', label: 'Críticas' },
    { key: 'mayor', label: 'Mayores' },
    { key: 'menor', label: 'Menores' },
  ];

  readonly filtered = computed<AlertItem[]>(() => {
    const items = this.state.data()?.alerts?.items ?? [];
    return this.filter() === 'todas' ? items : items.filter((a) => a.severity === this.filter());
  });

  count(key: SevFilter): number {
    const alerts = this.state.data()?.alerts;
    if (!alerts) {
      return 0;
    }
    return key === 'todas' ? alerts.total : alerts.by_severity[key] ?? 0;
  }

  sevColor(severity: string): string {
    return SEV_COLORS[severity] ?? '#8b949e';
  }
}
