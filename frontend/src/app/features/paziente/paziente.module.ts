import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PazienteRoutingModule } from './paziente-routing.module';

import { DashboardPazienteComponent } from './dashboard-paziente/dashboard-paziente';
import { VisualizzaPianoComponent } from './visualizza-piano/visualizza-piano';

@NgModule({
  imports: [
    CommonModule,
    PazienteRoutingModule,
    DashboardPazienteComponent,
    VisualizzaPianoComponent
  ]
})
export class PazienteModule { }