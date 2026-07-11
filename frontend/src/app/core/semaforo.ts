import { Semaforo } from './models/dashboard.models';

export const SEMAFORO_COLORS: Record<Semaforo, string> = {
  verde: '#22c55e',
  ambar: '#f59e0b',
  rojo: '#ef4444',
};

export const SEMAFORO_LABELS: Record<Semaforo, string> = {
  verde: 'Operativo',
  ambar: 'Parcial / alerta',
  rojo: 'Fuera de servicio',
};

export function pm10Level(value: number | null): 'low' | 'mid' | 'high' {
  if (value === null) {
    return 'low';
  }
  if (value >= 250) {
    return 'high';
  }
  if (value >= 150) {
    return 'mid';
  }
  return 'low';
}

export const PM10_LEVEL_COLORS = { low: '#22c55e', mid: '#f59e0b', high: '#ef4444' };
