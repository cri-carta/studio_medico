import { Routes } from '@angular/router';
import { DashboardPazienteComponent } from './dashboard-paziente/dashboard-paziente';
import { VisualizzaPianoComponent } from './visualizza-piano/visualizza-piano';

export const pazienteRoutes: Routes = [
  {
    path: '', 
    component: DashboardPazienteComponent
  },
  {
    path: 'paziente/piano',
    component: VisualizzaPianoComponent
  }
];