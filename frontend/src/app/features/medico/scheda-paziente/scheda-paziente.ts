import { Component } from '@angular/core';

/**
 * @description
 * Il componente `SchedaPazienteComponent` è responsabile della visualizzazione
 * della scheda informativa completa del paziente.
 * * In futuro, questo componente gestirà:
 * - Dati anagrafici e di contatto.
 * - Note cliniche o patologie pregresse.
 * - Stato dell'abbonamento o validità del piano.
 */
@Component({
  standalone: true,
  selector: 'app-scheda-paziente',
  imports: [],
  templateUrl: './scheda-paziente.html',
  styleUrl: './scheda-paziente.css',
})
export class SchedaPazienteComponent {
  /**
   * Esempio: Input che verrà utilizzato per ricevere i dati del paziente dal componente padre
   * @Input() paziente: Paziente | null = null;
   */
}