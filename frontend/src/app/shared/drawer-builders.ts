import { ProcessPoint, SystemCard } from '../core/models/dashboard.models';
import { DrawerContent } from '../core/services/detail-drawer.service';
import { PM10_LEVEL_COLORS, SEMAFORO_COLORS, SEMAFORO_LABELS, pm10Level } from '../core/semaforo';

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
