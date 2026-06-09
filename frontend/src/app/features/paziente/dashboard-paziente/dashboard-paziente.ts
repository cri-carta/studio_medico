import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicoService, Paziente } from '../../medico/medico.service';
import { AuthService } from '../../../core/auth/auth.service';
import { inject } from '@angular/core';

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

  private authService = inject(AuthService);

  constructor(private medicoService: MedicoService) {}

  ngOnInit(): void {
    const utenteId = localStorage.getItem('utenteId');
    if (utenteId) {
      this.medicoService.getProfiloPaziente(Number(utenteId)).subscribe({
        next: (dati: Paziente) => {
          this.paziente = dati;
          this.isLoading = false;
        },
        error: (err: any) => console.error('Errore recupero profilo', err)
      });
    }
  }

  setVista(tipo: 'tabella' | 'progressi') {
    this.vistaAttiva = tipo;
  }

  logout() {
    this.authService.logout();
  }
}