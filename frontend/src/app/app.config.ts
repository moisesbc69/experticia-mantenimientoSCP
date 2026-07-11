import { ApplicationConfig, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import localeEsCl from '@angular/common/locales/es-CL';

import { provideLucideIcons } from './core/icons';
import { routes } from './app.routes';

registerLocaleData(localeEsCl);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(),
    provideAnimations(),
    provideRouter(
      routes,
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'top' }),
    ),
    { provide: LOCALE_ID, useValue: 'es-CL' },
    provideLucideIcons(),
  ],
};
