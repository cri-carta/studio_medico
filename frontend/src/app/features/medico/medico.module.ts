import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicoRoutingModule } from './medico-routing.module';

// Componenti del modulo
import { DashboardMedicoComponent } from './dashboard-medico/dashboard-medico';
import { SchedaPazienteComponent } from './scheda-paziente/scheda-paziente';
import { PianoAlimentareComponent } from './piano-alimentare/piano-alimentare';

@NgModule({
  imports: [
    CommonModule,
    MedicoRoutingModule,
    DashboardMedicoComponent,
    SchedaPazienteComponent,
    PianoAlimentareComponent
    // Qui importerai moduli condivisi (es. tabelle, grafici) in futuro
  ]
})
export class MedicoModule { }