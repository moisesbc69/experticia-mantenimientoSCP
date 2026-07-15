// Interfaces tipadas del payload de /api/plants/{id}/dashboard/

export interface Plant {
  id: number;
  name: string;
  client: string;
  general_status: string;
  general_status_detail: string;
  is_default: boolean;
  updated_at: string;
}

export interface Kpi {
  key: string;
  label: string;
  value: string;
  unit: string;
  delta: string;
  direction: 'up' | 'down' | '';
  delta_positive: boolean;
  comparison: string;
  icon: string;
  order: number;
  simulated: boolean;
}

export interface ProcessPoint {
  id: number;
  name: string;
  order: number;
  icon: string;
  has_sensor: boolean;
  pm10: number | null;
  simulated_pm10: boolean;
  area: string;
}

export interface SystemMetric {
  label: string;
  value: string;
  unit: string;
  sparkline: number[];
  simulated: boolean;
}

export type Semaforo = 'verde' | 'ambar' | 'rojo';

export interface SystemCard {
  id: number;
  name: string;
  kind: 'supresor' | 'humectador' | 'filtro';
  kind_display: string;
  tag: string;
  order: number;
  area: string;
  indicator_label: string;
  nozzles_installed: number;
  nozzles_operative: number;
  nozzles_running: number;
  disponibilidad: number;
  utilizacion: number;
  estado_semaforo: Semaforo;
  stop_reason: string | null;
  stop_reason_display: string | null;
  metrics: SystemMetric[];
}

export type Pm10Range = 'hoy' | '7d' | '30d';

export interface Pm10Series {
  range: Pm10Range;
  labels: string[];
  current: number[];
  previous: number[];
  simulated: boolean;
}

export interface AlertItem {
  id: number;
  severity: 'critica' | 'mayor' | 'menor';
  severity_display: string;
  message: string;
  system: string | null;
  timestamp: string;
}

export interface AlertsBlock {
  total: number;
  by_severity: { critica: number; mayor: number; menor: number };
  items: AlertItem[];
}

export interface EnvironmentReading {
  temperature_c: number;
  humidity_pct: number;
  wind_direction: string;
  wind_speed_kmh: number;
  simulated: boolean;
}

export interface MitigationImpact {
  reduction_pct: number;
  without_mitigation: number;
  with_mitigation: number;
  simulated: boolean;
}

export interface WorkOrderPhoto {
  label: string;
  taken_at: string;
}

export interface WorkOrder {
  id: number;
  number: string;
  kind: 'preventiva' | 'correctiva' | 'inspeccion';
  kind_display: string;
  status: 'abierta' | 'en_ejecucion' | 'cerrada';
  status_display: string;
  system: string;
  system_id: number;
  system_tag: string;
  technician: string;
  scheduled_at: string;
  duration_hours: number;
  description: string;
  tasks: string[];
  photos: WorkOrderPhoto[];
}

export interface DashboardPayload {
  plant: Plant;
  kpis: Kpi[];
  process_points: ProcessPoint[];
  pm10_series: Pm10Series[];
  systems: SystemCard[];
  alerts: AlertsBlock;
  environment: EnvironmentReading | null;
  mitigation: MitigationImpact | null;
  work_orders: WorkOrder[];
}
