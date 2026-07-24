import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';

import { ProcessPoint, SystemCard } from '../../core/models/dashboard.models';
import {
  PM10_LEVEL_COLORS,
  SEMAFORO_COLORS,
  SEMAFORO_LABELS,
  findSystemForPoint,
  pm10Level,
} from '../../core/semaforo';
import { DashboardStateService } from '../../core/services/dashboard-state.service';
import { DetailDrawerService } from '../../core/services/detail-drawer.service';
import { pointDrawer, systemDrawer } from '../../shared/drawer-builders';

type Glyph =
  | 'truck'
  | 'hopper'
  | 'feeder'
  | 'crusher'
  | 'conveyor'
  | 'chute'
  | 'overland'
  | 'baghouse'
  | 'collector'
  | 'screen'
  | 'motor';

interface Zone {
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

// Disposición fija (mímico) de cada punto de proceso real, por orden.
interface PointLayout {
  order: number;
  x: number;
  y: number;
  glyph: Glyph;
}

// Nodo de sistema de colección de polvo (no es punto de proceso).
interface CollectorLayout {
  match: string; // substring del nombre del sistema
  x: number;
  y: number;
  glyph: Glyph;
  label: string;
}

interface Flow {
  d: string;
  kind: 'material' | 'supply' | 'duct';
}

// Etiqueta de apoyo (densidad del mímico): boquillas, motores, pasarelas, harneros.
interface SupportTag {
  tag: string;
  x: number;
  y: number;
  status: 'green' | 'amber' | 'orange';
  anchor?: 'start' | 'end';
}

interface MainNode {
  key: string;
  x: number;
  y: number;
  glyph: Glyph;
  num: string | null;
  name: string;
  sysTag: string;
  pm: number | null;
  pmColor: string;
  statusColor: string;
  statusLabel: string;
  point?: ProcessPoint;
  system?: SystemCard;
}

const POINT_LAYOUT: PointLayout[] = [
  { order: 1, x: 150, y: 130, glyph: 'truck' },
  { order: 2, x: 150, y: 250, glyph: 'hopper' },
  { order: 3, x: 150, y: 365, glyph: 'feeder' },
  { order: 4, x: 150, y: 480, glyph: 'crusher' },
  { order: 5, x: 400, y: 540, glyph: 'conveyor' },
  { order: 6, x: 720, y: 250, glyph: 'chute' },
  { order: 7, x: 740, y: 450, glyph: 'overland' },
];

const COLLECTOR_LAYOUT: CollectorLayout[] = [
  { match: 'filtro', x: 1090, y: 210, glyph: 'baghouse', label: 'Filtros de mangas' },
  { match: 'colector', x: 1090, y: 400, glyph: 'collector', label: 'Colector de polvo' },
];

const ZONES: Zone[] = [
  { title: 'CHANCADO', x: 12, y: 62, w: 548, h: 566 },
  { title: 'TORRE DE TRANSFERENCIA', x: 580, y: 62, w: 320, h: 566 },
  { title: 'COLECCIÓN DE POLVO / FILTROS', x: 920, y: 62, w: 368, h: 470 },
];

// Líneas del mímico (serpenteantes). teal = material, rosado = supresión/agua, gris = ducto de polvo.
const FLOWS: Flow[] = [
  // Material: camión → tolva → alimentador → chancador → correa → chute → overland
  { kind: 'material', d: 'M 150 165 V 218' },
  { kind: 'material', d: 'M 150 282 V 333' },
  { kind: 'material', d: 'M 150 397 V 448' },
  { kind: 'material', d: 'M 150 512 V 540 H 330' },
  { kind: 'material', d: 'M 470 540 H 640 V 250 H 685' },
  { kind: 'material', d: 'M 720 285 V 450 H 700' },
  { kind: 'material', d: 'M 785 450 H 900' },
  // Supresión / agua (cabecera superior con bajadas a cada equipo con sistema)
  { kind: 'supply', d: 'M 150 95 H 780' },
  { kind: 'supply', d: 'M 150 95 V 232' },
  { kind: 'supply', d: 'M 150 95 V 347' },
  { kind: 'supply', d: 'M 150 95 V 462' },
  { kind: 'supply', d: 'M 400 95 V 522' },
  { kind: 'supply', d: 'M 720 95 V 230' },
  { kind: 'supply', d: 'M 740 95 V 432' },
  // Ducto de captación de polvo hacia los colectores
  { kind: 'duct', d: 'M 150 480 H 960 V 210 H 1055' },
  { kind: 'duct', d: 'M 720 250 H 980 V 400 H 1055' },
];

const SUPPORT_TAGS: SupportTag[] = [
  // Boquillas / cabezales de los supresores y humectadores
  { tag: 'CAB-01 · 24 boq', x: 205, y: 232, status: 'green' },
  { tag: 'CAB-02 · 22 boq', x: 205, y: 347, status: 'green' },
  { tag: 'CAB-04 · 24 boq', x: 205, y: 462, status: 'amber' },
  { tag: 'HUM-05', x: 452, y: 522, status: 'amber' },
  { tag: 'CAB-06', x: 775, y: 226, status: 'green' },
  { tag: 'HUM-07', x: 795, y: 432, status: 'green' },
  // Motores / pasarelas (densidad)
  { tag: 'ME-01', x: 95, y: 200, status: 'green', anchor: 'end' },
  { tag: 'ME-04', x: 95, y: 515, status: 'green', anchor: 'end' },
  { tag: 'PASILLO CV05', x: 300, y: 575, status: 'green' },
  { tag: 'PASILLO OVERLAND', x: 615, y: 400, status: 'green' },
  // Harneros que alimentan la colección (zona 3)
  { tag: 'SN-01', x: 960, y: 150, status: 'green' },
  { tag: 'SN-02', x: 960, y: 300, status: 'green' },
  { tag: 'VENT-01', x: 1180, y: 300, status: 'green' },
  { tag: 'DUCTO PRINCIPAL', x: 985, y: 470, status: 'green' },
];

@Component({
  selector: 'app-flujo-scada',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './flujo-scada.component.html',
  styleUrl: './flujo-scada.component.scss',
})
export class FlujoScadaComponent {
  readonly state = inject(DashboardStateService);
  private drawer = inject(DetailDrawerService);

  readonly zones = ZONES;
  readonly flows = FLOWS;
  readonly supportTags = SUPPORT_TAGS;
  readonly selectedKey = signal<string | null>(null);

  private readonly points = computed<ProcessPoint[]>(() => this.state.data()?.process_points ?? []);
  private readonly systems = computed<SystemCard[]>(() => this.state.data()?.systems ?? []);

  readonly mainNodes = computed<MainNode[]>(() => {
    const points = this.points();
    const systems = this.systems();
    const nodes: MainNode[] = [];

    // Puntos de proceso reales
    for (const layout of POINT_LAYOUT) {
      const point = points.find((p) => p.order === layout.order);
      if (!point) continue;
      const system = findSystemForPoint(point, systems);
      nodes.push({
        key: `p${layout.order}`,
        x: layout.x,
        y: layout.y,
        glyph: layout.glyph,
        num: String(point.order).padStart(2, '0'),
        name: point.name,
        sysTag: system ? system.tag : 'Sin sistema',
        pm: point.pm10,
        pmColor: PM10_LEVEL_COLORS[pm10Level(point.pm10)],
        statusColor: system ? SEMAFORO_COLORS[system.estado_semaforo] : '#6b7480',
        statusLabel: system ? SEMAFORO_LABELS[system.estado_semaforo] : 'Sin sistema',
        point,
        system,
      });
    }

    // Sistemas de colección (filtros / colector de polvo)
    for (const layout of COLLECTOR_LAYOUT) {
      const system = systems.find((s) => s.name.toLowerCase().includes(layout.match));
      nodes.push({
        key: `c${layout.match}`,
        x: layout.x,
        y: layout.y,
        glyph: layout.glyph,
        num: null,
        name: system ? system.name : layout.label,
        sysTag: system ? system.tag : '—',
        pm: null,
        pmColor: '#6b7480',
        statusColor: system ? SEMAFORO_COLORS[system.estado_semaforo] : '#6b7480',
        statusLabel: system ? SEMAFORO_LABELS[system.estado_semaforo] : '—',
        system,
      });
    }
    return nodes;
  });

  readonly maxPm = computed(() =>
    Math.max(1, ...this.mainNodes().map((n) => n.pm ?? 0)),
  );

  supportColor(status: SupportTag['status']): string {
    return { green: '#37d67a', amber: '#f5c518', orange: '#f2792b' }[status];
  }

  isSelected(n: MainNode): boolean {
    return this.selectedKey() === n.key;
  }

  select(n: MainNode): void {
    this.selectedKey.set(n.key);
    if (n.point) {
      this.drawer.open(pointDrawer(n.point, n.system));
    } else if (n.system) {
      this.drawer.open(systemDrawer(n.system));
    }
  }
}
