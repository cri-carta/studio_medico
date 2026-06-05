import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardPazienteComponent } from './dashboard-paziente/dashboard-paziente';
import { VisualizzaPianoComponent } from './visualizza-piano/visualizza-piano';

const routes: Routes = [
  {
    path: '',
    component: DashboardPazienteComponent // Atterra su /paziente
  },
  {
    path: 'mio-piano',
    component: VisualizzaPianoComponent // Va su /paziente/mio-piano
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PazienteRoutingModule { }