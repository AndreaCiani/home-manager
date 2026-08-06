import {
  ApplicationConfig,
  provideZoneChangeDetection,
  provideAppInitializer,
  inject,
  isDevMode,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';
import { authInterceptor } from './interceptors/auth.interceptor';
import { AuthService } from './services/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // HttpClient with fetch, our 401 handler, and Angular's built-in XSRF support
    // (reads the XSRF-TOKEN cookie, sends the X-XSRF-TOKEN header).
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    // Establish the current session before the first route is evaluated.
    provideAppInitializer(() => inject(AuthService).loadCurrentUser()),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
