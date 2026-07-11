import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { LucideIcons } from '../../core/icons';
import { DashboardStateService } from '../../core/services/dashboard-state.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideIcons],
  templateUrl: './configuracion.component.html',
  styleUrl: './configuracion.component.scss',
})
export class ConfiguracionComponent {
  readonly state = inject(DashboardStateService);
  private toast = inject(ToastService);

  // Valores locales de la demo (no persisten en el backend)
  readonly clientName = signal('BHP · Faena Spence');
  readonly language = signal('es');
  readonly greenThreshold = signal(85);
  readonly pm10AlertThreshold = signal(250);
  readonly refreshSeconds = signal(30);

  save(): void {
    this.toast.show('Configuración guardada (demo)');
  }
}
