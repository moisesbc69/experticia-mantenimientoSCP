import { Injectable, signal } from '@angular/core';

export interface DrawerRow {
  label: string;
  value: string;
  color?: string;
}

export interface DrawerSpark {
  label: string;
  values: number[];
  color: string;
  suffix?: string;
}

export interface DrawerContent {
  title: string;
  subtitle?: string;
  badge?: { text: string; color: string };
  rows: DrawerRow[];
  sparks?: DrawerSpark[];
  note?: string;
}

/** Drawer lateral de detalle: lo abre cualquier vista (nodo, sistema, KPI…). */
@Injectable({ providedIn: 'root' })
export class DetailDrawerService {
  readonly content = signal<DrawerContent | null>(null);

  open(content: DrawerContent): void {
    this.content.set(content);
  }

  close(): void {
    this.content.set(null);
  }
}
