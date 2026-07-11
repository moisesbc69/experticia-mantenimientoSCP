import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { LucideIcons } from '../../core/icons';
import { DetailDrawerService } from '../../core/services/detail-drawer.service';
import { SparklineComponent } from '../../features/dashboard/components/systems-grid/sparkline.component';

@Component({
  selector: 'app-detail-drawer',
  standalone: true,
  imports: [CommonModule, LucideIcons, SparklineComponent],
  templateUrl: './detail-drawer.component.html',
  styleUrl: './detail-drawer.component.scss',
})
export class DetailDrawerComponent {
  readonly drawer = inject(DetailDrawerService);
}
