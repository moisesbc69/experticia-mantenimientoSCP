import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';

import { LucideIcons } from '../../core/icons';
import { ProcessPoint, SystemCard } from '../../core/models/dashboard.models';
import { DashboardStateService } from '../../core/services/dashboard-state.service';
import { DetailDrawerService } from '../../core/services/detail-drawer.service';
import { PM10_LEVEL_COLORS, SEMAFORO_COLORS, findSystemForPoint, pm10Level } from '../../core/semaforo';
import { pointDrawer, systemDrawer } from '../../shared/drawer-builders';

interface AreaGroup {
  name: string;
  points: ProcessPoint[];
  systems: SystemCard[];
}

@Component({
  selector: 'app-planta',
  standalone: true,
  imports: [CommonModule, LucideIcons],
  templateUrl: './planta.component.html',
  styleUrl: './planta.component.scss',
})
export class PlantaComponent {
  readonly state = inject(DashboardStateService);
  private drawer = inject(DetailDrawerService);

  readonly areas = computed<AreaGroup[]>(() => {
    const data = this.state.data();
    if (!data) {
      return [];
    }
    const names = [...new Set([
      ...data.process_points.map((p) => p.area),
      ...data.systems.map((s) => s.area),
    ])];
    return names.map((name) => ({
      name,
      points: data.process_points.filter((p) => p.area === name),
      systems: data.systems.filter((s) => s.area === name),
    }));
  });

  pm10Color(value: number | null): string {
    return PM10_LEVEL_COLORS[pm10Level(value)];
  }

  semColor(state: SystemCard['estado_semaforo']): string {
    return SEMAFORO_COLORS[state];
  }

  openPoint(point: ProcessPoint): void {
    const system = findSystemForPoint(point, this.state.data()?.systems ?? []);
    this.drawer.open(pointDrawer(point, system));
  }

  openSystem(system: SystemCard): void {
    this.drawer.open(systemDrawer(system));
  }
}
