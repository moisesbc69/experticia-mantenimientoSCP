import { ProcessPoint, SystemCard, WorkOrder } from '../core/models/dashboard.models';
import { DrawerContent } from '../core/services/detail-drawer.service';
import { PM10_LEVEL_COLORS, SEMAFORO_COLORS, SEMAFORO_LABELS, pm10Level } from '../core/semaforo';

export const WO_STATUS_COLORS: Record<WorkOrder['status'], string> = {
  abierta: '#8b949e',
  en_ejecucion: '#3b82f6',
  cerrada: '#22c55e',
};

export const WO_KIND_COLORS: Record<WorkOrder['kind'], string> = {
  preventiva: '#38bdf8',
  correctiva: '#f59e0b',
  inspeccion: '#a78bfa',
};

function formatTime(iso: string): string {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())} h`;
}

/** Contenido del drawer para una orden de trabajo. */
export function workOrderDrawer(order: WorkOrder): DrawerContent {
  return {
    title: order.number,
    subtitle: order.description,
    badge: { text: order.status_display, color: WO_STATUS_COLORS[order.status] },
    rows: [
      { label: 'Sistema', value: order.system },
      { label: 'TAG', value: order.system_tag },
      { label: 'Tipo de OT', value: order.kind_display, color: WO_KIND_COLORS[order.kind] },
      { label: 'Técnico responsable', value: order.technician },
      { label: 'Programada', value: formatTime(order.scheduled_at) },
      ...(order.duration_hours
        ? [{ label: 'Duración', value: `${order.duration_hours.toString().replace('.', ',')} h` }]
        : []),
      {
        label: 'Registro fotográfico',
        value: order.photos.length ? `${order.photos.length} fotos` : 'Pendiente',
        color: order.photos.length ? '#22c55e' : '#8b949e',
      },
    ],
    bullets: order.tasks.length
      ? {
          title: order.status === 'cerrada' ? 'Tareas realizadas' : 'Tareas de la pauta',
          items: order.tasks,
        }
      : undefined,
    photos: order.photos.map((p) => ({ label: p.label, takenAt: p.taken_at })),
    note: order.photos.length
      ? 'Fotos de referencia (demo). En producción se mostrará el registro fotográfico capturado por el operario desde la app de terreno.'
      : 'OT aún sin registro fotográfico: se captura al ejecutar el trabajo en terreno.',
  };
}

/** Contenido del drawer para un punto de proceso (con su sistema asociado). */
export function pointDrawer(point: ProcessPoint, system?: SystemCard): DrawerContent {
  const level = pm10Level(point.pm10);
  return {
    title: `${String(point.order).padStart(2, '0')} · ${point.name}`,
    subtitle: `Punto de proceso · Área ${point.area}`,
    badge:
      point.pm10 !== null
        ? { text: `PM10 ${point.pm10} µg/m³N`, color: PM10_LEVEL_COLORS[level] }
        : undefined,
    rows: [
      {
        label: 'Sensor de polvo',
        value: point.has_sensor ? 'Instalado · en línea' : 'Sin sensor',
        color: point.has_sensor ? '#22c55e' : '#8b949e',
      },
      ...(system
        ? [
            { label: 'Sistema asociado', value: `${system.name} (${system.kind_display})` },
            { label: 'TAG', value: system.tag },
            {
              label: 'Disponibilidad',
              value: `${system.disponibilidad}% (${system.nozzles_operative}/${system.nozzles_installed} boquillas)`,
              color: SEMAFORO_COLORS[system.estado_semaforo],
            },
            { label: 'Utilización', value: `${system.utilizacion}%` },
            {
              label: 'Estado',
              value: SEMAFORO_LABELS[system.estado_semaforo],
              color: SEMAFORO_COLORS[system.estado_semaforo],
            },
            ...(system.stop_reason_display
              ? [{ label: 'Motivo de detención', value: system.stop_reason_display, color: '#f59e0b' }]
              : []),
          ]
        : [{ label: 'Sistema asociado', value: '—' }]),
    ],
    sparks: system?.metrics
      .filter((m) => m.sparkline.length)
      .map((m) => ({
        label: m.label,
        values: m.sparkline,
        color: SEMAFORO_COLORS[system.estado_semaforo],
        suffix: m.unit,
      })),
    note: 'La emisión PM10 es un dato simulado de la demo (hoy no se captura en terreno).',
  };
}

/** Contenido del drawer para un sistema de supresión/colección. */
export function systemDrawer(system: SystemCard): DrawerContent {
  return {
    title: system.name,
    subtitle: `${system.kind_display} · Área ${system.area}`,
    badge: {
      text: `${SEMAFORO_LABELS[system.estado_semaforo]} · ${system.disponibilidad}%`,
      color: SEMAFORO_COLORS[system.estado_semaforo],
    },
    rows: [
      { label: 'TAG', value: system.tag },
      { label: 'Boquillas instaladas', value: String(system.nozzles_installed) },
      { label: 'Boquillas operativas', value: String(system.nozzles_operative) },
      { label: 'Boquillas en funcionamiento', value: String(system.nozzles_running) },
      {
        label: 'Disponibilidad (op/inst)',
        value: `${system.disponibilidad}%`,
        color: SEMAFORO_COLORS[system.estado_semaforo],
      },
      { label: 'Utilización (func/inst)', value: `${system.utilizacion}%` },
      ...(system.stop_reason_display
        ? [{ label: 'Motivo de detención', value: system.stop_reason_display, color: '#f59e0b' }]
        : []),
    ],
    sparks: system.metrics
      .filter((m) => m.sparkline.length)
      .map((m) => ({
        label: m.label,
        values: m.sparkline,
        color: SEMAFORO_COLORS[system.estado_semaforo],
        suffix: m.unit,
      })),
    note: 'Presión, caudal y ΔP son datos simulados de la demo. Disponibilidad y utilización se derivan del catastro real de boquillas.',
  };
}
