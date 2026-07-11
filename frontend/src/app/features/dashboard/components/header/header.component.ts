import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject, signal } from '@angular/core';

import { LucideIcons } from '../../../../core/icons';
import { Plant } from '../../../../core/models/dashboard.models';
import { ToastService } from '../../../../core/services/toast.service';

const MONTHS_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, LucideIcons],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() plants: Plant[] = [];
  @Input() selectedPlantId: number | null = null;
  @Input() plant: Plant | null = null;
  @Input() alertsTotal = 0;
  @Output() plantChange = new EventEmitter<number>();

  private toast = inject(ToastService);
  readonly clock = signal('');
  readonly dropdownOpen = signal(false);
  private timer: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.tick();
    this.timer = setInterval(() => this.tick(), 1000);
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  private tick(): void {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    this.clock.set(
      `${now.getDate()} ${MONTHS_ES[now.getMonth()]} ${now.getFullYear()}, ` +
      `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
    );
  }

  toggleDropdown(): void {
    this.dropdownOpen.update((open) => !open);
  }

  pickPlant(plant: Plant): void {
    this.dropdownOpen.set(false);
    if (plant.id !== this.selectedPlantId) {
      this.plantChange.emit(plant.id);
    }
  }

  get statusOk(): boolean {
    return (this.plant?.general_status ?? '').toLowerCase().includes('normal');
  }

  decorative(): void {
    this.toast.show('Próximamente');
  }
}
