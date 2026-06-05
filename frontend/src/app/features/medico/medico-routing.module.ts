import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardMedicoComponent } from './dashboard-medico/dashboard-medico';
import { SchedaPazienteComponent } from './scheda-paziente/scheda-paziente';
import { PianoAlimentareComponent } from './piano-alimentare/piano-alimentare';

const routes: Routes = [
  {
    path: '',
    // Spesso qui si usa un componente "layout" con la navbar del medico,
    // per ora atterriamo direttamente sulla dashboard
    component: DashboardMedicoComponent 
  },
  {
    // Rotta per la scheda anagrafica e visite (es: /medico/paziente/5)
    path: 'paziente/:id', 
    component: SchedaPazienteComponent
  },
  {
    // Rotta per creare/modificare il piano con l'IA (es: /medico/paziente/5/piano)
    path: 'paziente/:id/piano',
    component: PianoAlimentareComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MedicoRoutingModule { }