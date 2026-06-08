import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PianoAlimentare, Visita } from '../../core/models/database.model';
import { RispostaTabellaAI, RispostaAnalisiAI } from '../../core/models/outputAI.model';

@Injectable({
  providedIn: 'root'
})
export class MedicoService {
  private readonly API_URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // 1. Chiama il RAG per generare la tabella del piano settimanale
  generaTabellaPiano(pazienteId: number): Observable<RispostaTabellaAI> {
    return this.http.post<RispostaTabellaAI>(`${this.API_URL}/rag/tabella`, { pazienteId });
  }

  // 2. Chiama il RAG per l'analisi dell'andamento (ritorna del testo/stringa da Ollama)
  getAnalisiAndamento(pazienteId: number): Observable<RispostaAnalisiAI> {
    return this.http.get<RispostaAnalisiAI>(`${this.API_URL}/rag/analisi/${pazienteId}`);
  }

  // 3. Effettua una nuova visita salvando i parametri clinici
  salvaVisita(visita: { paziente_id: number; medico_id: number; data_visita: string; peso: number; bmi: number; bf: number }): Observable<any> {
    return this.http.post(`${this.API_URL}/visite`, visita);
  }
}