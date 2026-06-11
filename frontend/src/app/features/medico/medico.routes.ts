import { Routes } from '@angular/router';
import { DashboardMedicoComponent } from './dashboard-medico/dashboard-medico';
import { SchedaPazienteComponent } from './scheda-paziente/scheda-paziente';
import { PianoAlimentareComponent } from './piano-alimentare/piano-alimentare';

/**
 * @description
 * Definisce le rotte di navigazione per la sezione "Medico" dell'applicazione.
 *
 * Percorsi gestiti:
 * - `''`: Dashboard principale con la lista dei pazienti.
 * - `'paziente/:id'`: Scheda di dettaglio di un singolo paziente.
 * - `'paziente/:id/piano'`: Piano alimentare associato al paziente.
 */
export const medicoRoutes: Routes = [
  {
    path: '',
    component: DashboardMedicoComponent // Questa è la tua homepage con la lista pazienti!
  },
  {
    path: 'paziente/:id',
    component: SchedaPazienteComponent
  },
  {
    path: 'paziente/:id/piano',
    component: PianoAlimentareComponent
  }
];