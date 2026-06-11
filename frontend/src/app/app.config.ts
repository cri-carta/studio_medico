import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { jwtInterceptor } from './core/auth/jwt.interceptor';
import { routes } from './app.routes';

/* Configurazione globale dell'applicazione Angular. */
export const appConfig: ApplicationConfig = {
  providers: [

    /* Registra i listener globali per la gestione degli errori. */
    provideBrowserGlobalErrorListeners(),

    /* Configura il sistema di routing utilizzando le rotte definite nell'applicazione. */
    provideRouter(routes),
<<<<<<< HEAD
    provideHttpClient()
=======

    /* Abilita l'utilizzo di HttpClient per le richieste HTTP. */
    provideHttpClient(withInterceptors([jwtInterceptor]))
>>>>>>> f5d78d72c83cc3d8fcda6306231ef4f9e17b051d
  ]
};