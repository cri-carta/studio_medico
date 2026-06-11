import { Component } from '@angular/core';

/**
 * @description
 * Il componente `PianoAlimentareComponent` funge da contenitore principale per
 * la gestione e la visualizzazione dell'intero piano nutrizionale.
 * * * Responsabilità previste:
 * - Rappresentare la pagina di destinazione per le operazioni sul piano alimentare.
 * - Integrare i componenti figli necessari (come `VisualizzaPianoComponent` o altri strumenti di editing).
 * - Gestire il layout della pagina dedicata alla nutrizione.
 */
@Component({
  standalone: true,
  selector: 'app-piano-alimentare',
  imports: [],
  templateUrl: './piano-alimentare.html',
  styleUrl: './piano-alimentare.css',
})
export class PianoAlimentareComponent {
  // In futuro, qui potresti inserire logiche di stato per la modifica del piano
}