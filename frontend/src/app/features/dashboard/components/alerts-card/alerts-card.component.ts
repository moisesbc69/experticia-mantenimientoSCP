import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';

import { LucideIcons } from '../../../../core/icons';
import { AlertsBlock } from '../../../../core/models/dashboard.models';

@Component({
  selector: 'app-alerts-card',
  standalone: true,
  imports: [CommonModule, LucideIcons],
  templateUrl: './alerts-card.component.html',
  styleUrl: './alerts-card.component.scss',
})
export class AlertsCardComponent {
  @Input() alerts: AlertsBlock | null = null;

  private router = inject(Router);

  seeAll(): void {
    this.router.navigate(['/alertas']);
  }
}
