import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { DashboardStateService } from '../../core/services/dashboard-state.service';
import { KpiRowComponent } from './components/kpi-row/kpi-row.component';
import { ProcessFlowComponent } from './components/process-flow/process-flow.component';
import { Pm10PanelComponent } from './components/pm10-panel/pm10-panel.component';
import { MitigationGaugeComponent } from './components/mitigation-gauge/mitigation-gauge.component';
import { EnvironmentCardComponent } from './components/environment-card/environment-card.component';
import { AlertsCardComponent } from './components/alerts-card/alerts-card.component';
import { SystemsGridComponent } from './components/systems-grid/systems-grid.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    KpiRowComponent,
    ProcessFlowComponent,
    Pm10PanelComponent,
    MitigationGaugeComponent,
    EnvironmentCardComponent,
    AlertsCardComponent,
    SystemsGridComponent,
    FooterComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  readonly state = inject(DashboardStateService);
}
