import { Routes } from '@angular/router';
import { DashboardMedicoComponent } from './dashboard-medico/dashboard-medico';
import { SchedaPazienteComponent } from './scheda-paziente/scheda-paziente';
import { PianoAlimentareComponent } from './piano-alimentare/piano-alimentare';

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