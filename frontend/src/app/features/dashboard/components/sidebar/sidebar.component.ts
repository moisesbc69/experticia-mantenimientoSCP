import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';

import { LucideIcons } from '../../../../core/icons';
import { ToastService } from '../../../../core/services/toast.service';

interface NavItem {
  icon: string;
  label: string;
  active?: boolean;
  expandable?: boolean;
  badge?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, LucideIcons],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  @Input() alertsTotal = 0;

  private toast = inject(ToastService);

  readonly items: NavItem[] = [
    { icon: 'layout-dashboard', label: 'Resumen', active: true },
    { icon: 'boxes', label: 'Planta', expandable: true },
    { icon: 'settings', label: 'Sistemas', expandable: true },
    { icon: 'cloud-fog', label: 'Polvo (PM)' },
    { icon: 'bell', label: 'Alertas', badge: true },
    { icon: 'file-text', label: 'Reportes' },
    { icon: 'history', label: 'Histórico' },
    { icon: 'settings', label: 'Configuración' },
  ];

  onNavigate(item: NavItem): void {
    if (!item.active) {
      this.toast.show('Próximamente');
    }
  }
}
