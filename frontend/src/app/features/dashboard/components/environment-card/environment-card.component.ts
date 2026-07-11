import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { LucideIcons } from '../../../../core/icons';
import { EnvironmentReading } from '../../../../core/models/dashboard.models';

@Component({
  selector: 'app-environment-card',
  standalone: true,
  imports: [CommonModule, LucideIcons],
  templateUrl: './environment-card.component.html',
  styleUrl: './environment-card.component.scss',
})
export class EnvironmentCardComponent {
  @Input() environment: EnvironmentReading | null = null;
}
