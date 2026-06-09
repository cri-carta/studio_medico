import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudioMedicoService, Paziente } from '../../../core/models/database.model';

@Component({
  selector: 'app-dashboard-paziente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-paziente.component.html',
  styleUrls: ['./dashboard-paziente.component.css']
})
export class DashboardPazienteComponent implements OnInit {
  paziente: Paziente | null = null;
  vistaAttiva: 'tabella' | 'progressi' = 'tabella';
  isLoading: boolean = true;

  constructor(private studioMedicoService: StudioMedicoService) {}

  ngOnInit(): void {
    const utenteId = localStorage.getItem('utenteId');
    if (utenteId) {
      this.studioMedicoService.getProfiloPaziente(Number(utenteId)).subscribe({
        next: (dati) => {
          this.paziente = dati; // I dati corrispondono alle colonne della tabella 'pazienti'
          this.isLoading = false;
        },
        error: (err) => console.error("Errore recupero profilo", err)
      });
    }
  }

  setVista(tipo: 'tabella' | 'progressi') {
    this.vistaAttiva = tipo;
  }

  logout() {
    // Logica di logout da implementare (cancellazione localStorage, redirect)
    console.log("Esecuzione Logout...");
  }
}