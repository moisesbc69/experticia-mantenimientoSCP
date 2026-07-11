import { EnvironmentProviders, importProvidersFrom } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import {
  Activity,
  Bell,
  Boxes,
  ChevronDown,
  CircleCheck,
  CloudFog,
  Droplet,
  Droplets,
  Eye,
  FileText,
  Filter,
  Gauge,
  Globe,
  History,
  Layers,
  LayoutDashboard,
  Map,
  Search,
  Settings,
  SunMedium,
  Thermometer,
  TriangleAlert,
  Truck,
  Wind,
  Workflow,
} from 'lucide-angular';

// Módulo de iconos para los `imports` de componentes standalone.
export const LucideIcons = LucideAngularModule;

// Registro global de los iconos usados (va en los providers de app.config).
export const provideLucideIcons = (): EnvironmentProviders =>
  importProvidersFrom(
    LucideAngularModule.pick({
      Activity,
      Bell,
      Boxes,
      ChevronDown,
      CircleCheck,
      CloudFog,
      Droplet,
      Droplets,
      Eye,
      FileText,
      Filter,
      Gauge,
      Globe,
      History,
      Layers,
      LayoutDashboard,
      Map,
      Search,
      Settings,
      SunMedium,
      Thermometer,
      TriangleAlert,
      Truck,
      Wind,
      Workflow,
    }),
  );
