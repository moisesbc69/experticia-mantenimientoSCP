import { Injectable, computed, inject, signal } from '@angular/core';

import { DashboardPayload, Plant } from '../models/dashboard.models';
import { DashboardService } from './dashboard.service';

/**
 * Estado compartido del panel: plantas, planta seleccionada y payload del
 * dashboard. Lo consumen el shell (header/sidebar) y todas las vistas.
 */
@Injectable({ providedIn: 'root' })
export class DashboardStateService {
  private api = inject(DashboardService);

  readonly plants = signal<Plant[]>([]);
  readonly selectedPlantId = signal<number | null>(null);
  readonly data = signal<DashboardPayload | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly alertsTotal = computed(() => this.data()?.alerts?.total ?? 0);
  readonly plant = computed(() => this.data()?.plant ?? null);

  private initialized = false;

  init(): void {
    if (this.initialized) {
      return;
    }
    this.initialized = true;
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
