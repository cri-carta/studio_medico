import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Paziente } from '../../../core/models/database.model';
import { MedicoService, PianoVoce, Visita } from '../../medico/medico.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { VisualizzaPianoComponent } from '../visualizza-piano/visualizza-piano';
import { PianoSettimanaleAI } from '../../../core/models/outputAI.model';

@Component({
  selector: 'app-dashboard-paziente',
  standalone: true,
  imports: [CommonModule, VisualizzaPianoComponent],
  templateUrl: './dashboard-paziente.html',
  styleUrls: ['./dashboard-paziente.css']
})
export class DashboardPazienteComponent implements OnInit {
  paziente: Paziente | null = null;
  vistaAttiva: 'tabella' | 'progressi' = 'tabella';
  isLoading: boolean = true;
  pianoStrutturato: Record<string, Record<string, PianoVoce[]>> = {};
  pianoAlimentareRAG: PianoSettimanaleAI | null = null;
  storicoVisite: Visita[] = [];
  progressSummary = {
    primoPeso: 0, ultimoPeso: 0, pesoDelta: 0,
    primoBMI: 0,  ultimoBMI: 0,  bmiDelta: 0,
    primoBF: 0,   ultimoBF: 0,   bfDelta: 0,
    dataInizio: '', dataFine: ''
  };

  giorniChiave = ['lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato', 'domenica'];
  pastiChiave = ['colazione', 'pranzo', 'spuntino', 'cena'];

  constructor(
    private medicoService: MedicoService,
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const idNumerico = this.authService.userId();

    if (idNumerico !== null) {
      this.medicoService.getProfiloPaziente(idNumerico).subscribe({
        next: (dati: Paziente) => {
          this.paziente = dati;
          this.cdr.detectChanges();
          this.caricaDatiConnessi(dati.id);
        },
        error: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.router.navigate(['/auth/login']);
      this.isLoading = false;
    }
  }

  caricaDatiConnessi(pazienteId: number): void {
    this.medicoService.getPianoSalvato(pazienteId).subscribe({
      next: (res) => {
        this.pianoAlimentareRAG = res.piano;
        this.cdr.detectChanges();
      },
      error: () => {}
    });

    this.medicoService.getPianoCompletoPaziente(pazienteId).subscribe({
      next: (vociPiano: PianoVoce[]) => {
        this.inizializzaMappaVuota();
        vociPiano.forEach((voce: PianoVoce) => {
          const g = voce.giorno.toLowerCase().trim();
          const p = voce.tipo_pasto.toLowerCase().trim();
          if (this.pianoStrutturato[g] && this.pianoStrutturato[g][p]) {
            this.pianoStrutturato[g][p].push(voce);
          }
        });
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
      }
    });

    this.medicoService.getStoricoVisite(pazienteId).subscribe({
      next: (visite: Visita[]) => {
        this.storicoVisite = visite;
        this.calcolaProgressi(visite);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  private calcolaProgressi(visite: Visita[]): void {
    if (!visite || visite.length < 2) return;

    const sorted = [...visite].sort(
      (a, b) => new Date(a.data_visita).getTime() - new Date(b.data_visita).getTime()
    );

    const primo = sorted[0];
    const ultimo = sorted[sorted.length - 1];

    this.progressSummary = {
      primoPeso:  primo.peso,
      ultimoPeso: ultimo.peso,
      pesoDelta:  Number((ultimo.peso - primo.peso).toFixed(1)),
      primoBMI:   primo.bmi,
      ultimoBMI:  ultimo.bmi,
      bmiDelta:   Number((ultimo.bmi - primo.bmi).toFixed(1)),
      primoBF:    primo.bf,
      ultimoBF:   ultimo.bf,
      bfDelta:    Number((ultimo.bf - primo.bf).toFixed(1)),
      dataInizio: primo.data_visita,
      dataFine:   ultimo.data_visita
    };
  }

  private inizializzaMappaVuota(): void {
    this.giorniChiave.forEach(g => {
      this.pianoStrutturato[g] = {};
      this.pastiChiave.forEach(p => {
        this.pianoStrutturato[g][p] = [];
      });
    });
  }

  getGiorni(): {giorno: string, dati: any}[] {
    if (!this.pianoAlimentareRAG?.piano_settimanale) return [];
    return Object.entries(this.pianoAlimentareRAG.piano_settimanale)
      .map(([giorno, dati]) => ({ giorno, dati }));
  }

  getPasti(datiGiorno: any): {tipo: string, alimenti: any[]}[] {
    if (!datiGiorno?.pasti) return [];
    return Object.entries(datiGiorno.pasti)
      .map(([tipo, alimenti]) => ({ tipo, alimenti: alimenti as any[] }));
  }

  setVista(tipo: 'tabella' | 'progressi') {
    this.vistaAttiva = tipo;
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/auth/login']);
  }
}