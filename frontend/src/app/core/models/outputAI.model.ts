/** Singolo alimento all'interno di un pasto, con relativa grammatura. */
export interface VoceAlimento {
  alimento: string;
  grammatura: string;
}

/** Struttura del piano alimentare AI per un singolo giorno. */
export interface GiornoPianoAI {
  /** Pasti previsti per la giornata, suddivisi per tipologia. */
  pasti: {
    Colazione?: VoceAlimento[];
    Pranzo?: VoceAlimento[];
    Merenda?: VoceAlimento[];
    Cena?: VoceAlimento[];
  };
  /** Totali nutrizionali aggregati per l'intera giornata. */
  totale_giornaliero: {
    calorie_totali: number;
    carboidrati_g: number;
    grassi_g: number;
    proteine_g: number;
  };
}

/** Piano alimentare settimanale generato dall'AI, organizzato per giorno. */
export interface PianoSettimanaleAI {
  /** Mappa giorno -> piano giornaliero. */
  piano_settimanale: {
    [giorno: string]: GiornoPianoAI;
  };
}

/**
 * Risposta del backend contenente la tabella del piano alimentare generata dall'AI
 * tramite RAG (Retrieval-Augmented Generation).
 */
export interface RispostaTabellaAI {
  /** Piano alimentare settimanale generato. */
  risposta: PianoSettimanaleAI;
  /** Elenco delle fonti documentali utilizzate per generare la risposta. */
  fonti: string[];
  /** Identificativi dei documenti utilizzati come contesto. */
  doc_ids: string[];
  /** Punteggi di similarità tra la query e i documenti recuperati. */
  similarita: number[];
  /** Indica se è stato trovato contesto rilevante per generare la risposta. */
  ha_contesto: boolean;
}

/**
 * Risposta del backend contenente l'analisi dei progressi del paziente
 * generata dall'AI.
 */
export interface RispostaAnalisiAI {
  /** Testo dell'analisi generata dall'AI. */
  analisi: string;
  /** Variazione del peso tra la prima e l'ultima visita. */
  delta_peso: number;
  /** Variazione del BMI tra la prima e l'ultima visita. */
  delta_bmi: number;
  /** Variazione della percentuale di massa grassa tra la prima e l'ultima visita. */
  delta_bf: number;
  /** Indica se il paziente ha mostrato un miglioramento complessivo. */
  ha_migliorato: boolean;
}