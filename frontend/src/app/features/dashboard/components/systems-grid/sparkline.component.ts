import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

/** Mini line chart SVG para las métricas de las tarjetas de sistemas. */
@Component({
  selector: 'app-sparkline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg [attr.viewBox]="'0 0 ' + width + ' ' + height" preserveAspectRatio="none" aria-hidden="true">
      <polyline
        [attr.points]="pointsAttr"
        fill="none"
        [attr.stroke]="color"
        stroke-width="1.6"
        stroke-linejoin="round"
        stroke-linecap="round"
      />
    </svg>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }

      svg {
        width: 100%;
        height: 100%;
        display: block;
      }
    `,
  ],
})
export class SparklineComponent {
  @Input() values: number[] = [];
  @Input() color = '#22c55e';

  readonly width = 100;
  readonly height = 28;

  get pointsAttr(): string {
    const values = this.values;
    if (!values.length) {
      return '';
    }
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    const pad = 3;
    const stepX = this.width / (values.length - 1 || 1);
    return values
      .map((v, i) => {
        const x = (i * stepX).toFixed(1);
        const y = (this.height - pad - ((v - min) / span) * (this.height - pad * 2)).toFixed(1);
        return `${x},${y}`;
      })
      .join(' ');
  }
}
