import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HeaderComponent } from './features/dashboard/components/header/header.component';
import { SidebarComponent } from './features/dashboard/components/sidebar/sidebar.component';
import { DetailDrawerComponent } from './shared/detail-drawer/detail-drawer.component';
import { DashboardStateService } from './core/services/dashboard-state.service';
import { ToastService } from './core/services/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, DetailDrawerComponent],
  template: `
    <div class="shell">
      <app-sidebar />
      <div class="main">
        <app-header />
        @if (state.error(); as err) {
          <div class="error-banner">{{ err }}</div>
        }
        <router-outlet />
      </div>
      <app-detail-drawer />
      @if (toast.message(); as msg) {
        <div class="toast">{{ msg }}</div>
      }
    </div>
  `,
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  readonly state = inject(DashboardStateService);
  readonly toast = inject(ToastService);

  ngOnInit(): void {
    this.state.init();
  }
}
