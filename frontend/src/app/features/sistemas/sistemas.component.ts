import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { LucideIcons } from '../../core/icons';
import { Semaforo, SystemCard } from '../../core/models/dashboard.models';
import { DashboardStateService } from '../../core/services/dashboard-state.service';
import { DetailDrawerService } from '../../core/services/detail-drawer.service';
import { SEMAFORO_COLORS, SEMAFORO_LABELS } from '../../core/semaforo';
import { systemDrawer } from '../../shared/drawer-builders';

type KindFilter = 'todos' | 'supresor' | 'humectador' | 'filtro';
type StateFilter = 'todos' | Semaforo;

@Component({
  selector: 'app-sistemas',
  standalone: true,
  imports: [CommonModule, LucideIcons],
  templateUrl: './sistemas.component.html',
  styleUrl: './sistemas.component.scss',
})
export class SistemasComponent {
  readonly state = inject(DashboardStateService);
  private drawer = inject(DetailDrawerService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly kindFilter = signal<KindFilter>('todos');
  readonly stateFilter = signal<StateFilter>('todos');

  readonly kinds: { key: KindFilter; label: string }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'supresor', label: 'Supresores' },
    { key: 'humectador', label: 'Humectadores' },
    { key: 'filtro', label: 'Filtros / colectores' },
  ];

  readonly states: { key: StateFilter; label: string }[] = [
    { key: 'todos', label: 'Cualquier estado' },
    { key: 'verde', label: 'Operativos' },
    { key: 'ambar', label: 'Parciales' },
    { key: 'rojo', label: 'Fuera de servicio' },
  ];

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const tipo = params.get('tipo') as KindFilter | null;
      this.kindFilter.set(tipo && tipo !== 'todos' ? tipo : 'todos');
    });
  }

  readonly filtered = computed<SystemCard[]>(() => {
    const systems = this.state.data()?.systems ?? [];
    return systems.filter(
      (s) =>
        (this.kindFilter() === 'todos' || s.kind === this.kindFilter()) &&
        (this.stateFilter() === 'todos' || s.estado_semaforo === this.stateFilter()),
    );
  });

  countKind(kind: KindFilter): number {
    const systems = this.state.data()?.systems ?? [];
    return kind === 'todos' ? systems.length : systems.filter((s) => s.kind === kind).length;
  }

  setKind(kind: KindFilter): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tipo: kind === 'todos' ? null : kind },
      queryParamsHandling: 'merge',
    });
  }

  semColor(sem: Semaforo): string {
    return SEMAFORO_COLORS[sem];
  }

  semLabel(sem: Semaforo): string {
    return SEMAFORO_LABELS[sem];
  }

  open(system: SystemCard): void {
    this.drawer.open(systemDrawer(system));
  }
}
