import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { LucideIcons } from '../../../../core/icons';
import { DashboardStateService } from '../../../../core/services/dashboard-state.service';

interface NavChild {
  label: string;
  route: string;
  queryParams?: Record<string, string>;
}

interface NavItem {
  icon: string;
  label: string;
  route?: string;
  badge?: boolean;
  children?: NavChild[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, LucideIcons, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  readonly state = inject(DashboardStateService);
  private router = inject(Router);

  readonly expanded = signal<Set<string>>(new Set());

  readonly items: NavItem[] = [
    { icon: 'layout-dashboard', label: 'Resumen', route: '/resumen' },
    {
      icon: 'boxes',
      label: 'Planta',
      children: [
        { label: 'Áreas y puntos', route: '/planta' },
        { label: 'Flujo del proceso', route: '/resumen' },
      ],
    },
    {
      icon: 'settings',
      label: 'Sistemas',
      children: [
        { label: 'Todos', route: '/sistemas' },
        { label: 'Supresores', route: '/sistemas', queryParams: { tipo: 'supresor' } },
        { label: 'Humectadores', route: '/sistemas', queryParams: { tipo: 'humectador' } },
        { label: 'Filtros / colectores', route: '/sistemas', queryParams: { tipo: 'filtro' } },
      ],
    },
    { icon: 'cloud-fog', label: 'Polvo (PM)', route: '/polvo' },
    { icon: 'bell', label: 'Alertas', route: '/alertas', badge: true },
    { icon: 'file-text', label: 'Reportes', route: '/reportes' },
    { icon: 'history', label: 'Histórico', route: '/historico' },
    { icon: 'settings', label: 'Configuración', route: '/configuracion' },
  ];

  toggle(item: NavItem): void {
    if (!item.children) {
      return;
    }
    this.expanded.update((set) => {
      const next = new Set(set);
      if (next.has(item.label)) {
        next.delete(item.label);
      } else {
        next.add(item.label);
      }
      return next;
    });
  }

  isExpanded(item: NavItem): boolean {
    return this.expanded().has(item.label);
  }

  goFlujo(): void {
    this.router.navigate(['/resumen'], { fragment: 'flujo' });
  }
}
