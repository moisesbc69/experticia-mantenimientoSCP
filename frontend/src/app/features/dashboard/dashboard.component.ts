import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';

import { DashboardService } from '../../core/services/dashboard.service';
import { ToastService } from '../../core/services/toast.service';
import { DashboardPayload, Plant } from '../../core/models/dashboard.models';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
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
    HeaderComponent,
    SidebarComponent,
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
export class DashboardComponent implements OnInit {
  private api = inject(DashboardService);
  readonly toast = inject(ToastService);

  readonly plants = signal<Plant[]>([]);
  readonly selectedPlantId = signal<number | null>(null);
  readonly data = signal<DashboardPayload | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.api.getPlants().subscribe({
      next: (plants) => {
        this.plants.set(plants);
        const initial = plants.find((p) => p.is_default) ?? plants[0];
        if (initial) {
          this.selectPlant(initial.id);
        } else {
          this.loading.set(false);
          this.error.set('No hay plantas configuradas. Ejecuta el seed del backend.');
        }
      },
      error: () => {
        this.loading.set(false);
        this.error.set('No se pudo conectar con la API. ¿Está corriendo el backend en :8000?');
      },
    });
  }

  selectPlant(plantId: number): void {
    this.selectedPlantId.set(plantId);
    this.loading.set(true);
    this.api.getDashboard(plantId).subscribe({
      next: (payload) => {
        this.data.set(payload);
        this.loading.set(false);
        this.error.set(null);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Error al cargar el dashboard de la planta.');
      },
    });
  }
}
