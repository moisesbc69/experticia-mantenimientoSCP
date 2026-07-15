import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'resumen' },
  {
    path: 'resumen',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    title: 'Resumen · Experticia IIoT',
  },
  {
    path: 'planta',
    loadComponent: () => import('./features/planta/planta.component').then((m) => m.PlantaComponent),
    title: 'Planta · Experticia IIoT',
  },
  {
    path: 'flujo',
    loadComponent: () => import('./features/flujo/flujo.component').then((m) => m.FlujoComponent),
    title: 'Flujo del proceso · Experticia IIoT',
  },
  {
    path: 'sistemas',
    loadComponent: () =>
      import('./features/sistemas/sistemas.component').then((m) => m.SistemasComponent),
    title: 'Sistemas · Experticia IIoT',
  },
  {
    path: 'ots',
    loadComponent: () => import('./features/ots/ots.component').then((m) => m.OtsComponent),
    title: 'Órdenes de trabajo · Experticia IIoT',
  },
  {
    path: 'polvo',
    loadComponent: () => import('./features/polvo/polvo.component').then((m) => m.PolvoComponent),
    title: 'Polvo (PM) · Experticia IIoT',
  },
  {
    path: 'alertas',
    loadComponent: () =>
      import('./features/alertas/alertas.component').then((m) => m.AlertasComponent),
    title: 'Alertas · Experticia IIoT',
  },
  {
    path: 'reportes',
    loadComponent: () =>
      import('./features/reportes/reportes.component').then((m) => m.ReportesComponent),
    title: 'Reportes · Experticia IIoT',
  },
  {
    path: 'historico',
    loadComponent: () =>
      import('./features/historico/historico.component').then((m) => m.HistoricoComponent),
    title: 'Histórico · Experticia IIoT',
  },
  {
    path: 'configuracion',
    loadComponent: () =>
      import('./features/configuracion/configuracion.component').then((m) => m.ConfiguracionComponent),
    title: 'Configuración · Experticia IIoT',
  },
  { path: '**', redirectTo: 'resumen' },
];
