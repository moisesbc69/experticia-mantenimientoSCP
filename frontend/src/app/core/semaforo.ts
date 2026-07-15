import { ProcessPoint, Semaforo, SystemCard } from './models/dashboard.models';

/** Empareja un punto de proceso con su sistema asociado por nombre,
 * tolerando preposiciones ("Chute de Transferencia" ↔ "Chute Transferencia"). */
export function findSystemForPoint(
  point: ProcessPoint,
  systems: SystemCard[],
): SystemCard | undefined {
  const norm = (value: string) =>
    value.toLowerCase().replace(/\b(de|del|la|el)\b/g, '').replace(/\s+/g, ' ').trim();
  const pointName = norm(point.name);
  return systems.find((s) => {
    const systemName = norm(s.name);
    return pointName.startsWith(systemName.slice(0, 8)) || systemName.startsWith(pointName.slice(0, 8));
  });
}

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
