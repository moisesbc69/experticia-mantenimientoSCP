import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';

import { LucideIcons } from '../../../../core/icons';
import { AlertsBlock } from '../../../../core/models/dashboard.models';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-alerts-card',
  standalone: true,
  imports: [CommonModule, LucideIcons],
  templateUrl: './alerts-card.component.html',
  styleUrl: './alerts-card.component.scss',
})
export class AlertsCardComponent {
  @Input() alerts: AlertsBlock | null = null;

  private toast = inject(ToastService);

  seeAll(): void {
    this.toast.show('Próximamente');
  }
}
