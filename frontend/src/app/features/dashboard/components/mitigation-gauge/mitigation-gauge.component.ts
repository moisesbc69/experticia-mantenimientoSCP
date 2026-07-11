import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { MitigationImpact } from '../../../../core/models/dashboard.models';

@Component({
  selector: 'app-mitigation-gauge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mitigation-gauge.component.html',
  styleUrl: './mitigation-gauge.component.scss',
})
export class MitigationGaugeComponent {
  @Input() mitigation: MitigationImpact | null = null;

  /** Longitud del arco coloreado, proporcional a |reducción| (semicírculo r=52 → L≈163.4). */
  get arcDash(): string {
    const total = Math.PI * 52;
    const pct = Math.min(100, Math.abs(this.mitigation?.reduction_pct ?? 0));
    return `${(total * pct) / 100} ${total}`;
  }

  format(value: number | undefined): string {
    if (value === undefined) {
      return '—';
    }
    return Math.round(value).toLocaleString('en-US');
  }
}
