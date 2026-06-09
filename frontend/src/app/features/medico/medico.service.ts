import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PianoAlimentare, Visita } from '../../core/models/database.model';
import { RispostaTabellaAI, RispostaAnalisiAI } from '../../core/models/outputAI.model';

export interface NuovaVisita {
  paziente_id: number;
  data_visita: string; // Formato YYYY-MM-DD
  peso: number;
  bmi: number;
  bf: number;
}

export interface Paziente {
  id: number;
  medico_id: number;
  nome: string;
  cognome: string;
  data_nascita?: Date | string;
  altezza?: number;
  obiettivo?: string;
  anamnesi?: string;
}

@Injectable({
  providedIn: 'root'
})

export class MedicoService {
  private readonly API_URL = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  /**
   * 1. MEDICO: Recupera la lista di tutti i pazienti assegnati a un determinato medico
   */
  getPazientiPerMedico(medicoId: number): Observable<Paziente[]> {
    return this.http.get<Paziente[]>(`${this.API_URL}/medici/${medicoId}/pazienti`);
  }

  /**
   * 2. PAZIENTE: Recupera i dettagli anagrafici del singolo paziente partendo dal suo utente_id
   */
  getProfiloPaziente(utenteId: number): Observable<Paziente> {
    return this.http.get<Paziente>(`${this.API_URL}/pazienti/utente/${utenteId}`);
  }

  // 1. Chiama il RAG per generare la tabella del piano settimanale
  generaTabellaPiano(pazienteId: number): Observable<RispostaTabellaAI> {
    return this.http.post<RispostaTabellaAI>(`${this.API_URL}/rag/tabella`, { paziente_id: pazienteId });
}

  // 2. Chiama il RAG per l'analisi dell'andamento (ritorna del testo/stringa da Ollama)
  getAnalisiAndamento(pazienteId: number): Observable<RispostaAnalisiAI> {
    return this.http.get<RispostaAnalisiAI>(`${this.API_URL}/rag/analisi/${pazienteId}`);
  }

  // 3. Effettua una nuova visita salvando i parametri clinici
  salvaVisita(visita: NuovaVisita): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/visite`, visita);
  }
}