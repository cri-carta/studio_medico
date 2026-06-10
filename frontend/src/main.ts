import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

/* Avvia l'applicazione utilizzando il componente principale e la configurazione definita. */
bootstrapApplication(App, appConfig).catch((err) => console.error(err));
