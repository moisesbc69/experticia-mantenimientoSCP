import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { LucideIcons } from '../../../../core/icons';
import { Plant } from '../../../../core/models/dashboard.models';
import { DashboardStateService } from '../../../../core/services/dashboard-state.service';
import { LayoutService } from '../../../../core/services/layout.service';
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
  readonly state = inject(DashboardStateService);
  readonly layout = inject(LayoutService);
  private toast = inject(ToastService);
  private router = inject(Router);

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
    if (plant.id !== this.state.selectedPlantId()) {
      this.state.selectPlant(plant.id);
    }
  }

  get statusOk(): boolean {
    return (this.state.plant()?.general_status ?? '').toLowerCase().includes('normal');
  }

  goAlertas(): void {
    this.router.navigate(['/alertas']);
  }

  decorative(): void {
    this.toast.show('Próximamente');
  }
}
