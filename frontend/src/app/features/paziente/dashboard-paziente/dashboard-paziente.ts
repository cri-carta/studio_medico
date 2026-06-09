import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Paziente } from '../../../core/models/database.model';
import { MedicoService } from '../../medico/medico.service';
import { Router } from '@angular/router'; // Inserito per gestire il reindirizzamento al logout

@Component({
  selector: 'app-dashboard-paziente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-paziente.html',
  styleUrls: ['./dashboard-paziente.css']
})

export class DashboardPazienteComponent implements OnInit {
  paziente: Paziente | null = null;
  vistaAttiva: 'tabella' | 'progressi' = 'tabella';
  isLoading: boolean = true;

  constructor(
    private medicoService: MedicoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // 1. Recuperiamo la stringa salvata nel browser al momento del login
    const stringaUtenteId = localStorage.getItem('utenteId');

    // 2. Se esiste, facciamo il cast a numero e chiamiamo il backend
    if (stringaUtenteId) {
      const idNumerico = Number(stringaUtenteId);

      this.medicoService.getProfiloPaziente(idNumerico).subscribe({
        next: (dati) => {
          this.paziente = dati; // I dati corrispondono alle colonne della tabella 'pazienti'
          this.isLoading = false;
        },
        error: (err) => {
          console.error("Errore recupero profilo", err);
          this.isLoading = false;
        }
      });
    } else {
      // Se non c'è traccia dell'ID (es. localStorage svuotato), rimandalo al login per sicurezza
      this.router.navigate(['/login']);
    }
  }

  setVista(tipo: 'tabella' | 'progressi') {
    this.vistaAttiva = tipo;
  }

  logout() {
    console.log("Esecuzione Logout...");
    localStorage.clear(); // Svuota i dati di sessione (token, ruolo, utenteId)
    this.router.navigate(['/login']); // Reindirizza l'utente alla pagina di login
  }
}