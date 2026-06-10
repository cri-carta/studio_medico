/**
 * ==========================================================
 * MODELLO DATI - STUDIO MEDICO NUTRIZIONALE
 * ==========================================================
 *
 * Le interfacce rappresentano la struttura dati utilizzata
 * dall'applicazione e mappano le tabelle del database
 * `studio_medico_db`.
 *
 * Relazioni principali:
 * - Un Medico gestisce molti Pazienti.
 * - Un Paziente può avere molte Visite.
 * - Un Paziente può avere molti Piani Alimentari.
 * - Un Piano Alimentare contiene 7 Giorni.
 * - Ogni Giorno contiene uno o più Pasti.
 * - Ogni Pasto contiene una o più Voci Pasto.
 */

/**
 * Utente autenticato del sistema.
 *
 * Viene utilizzato per l'autenticazione e il controllo
 * degli accessi (RBAC).
 */
export interface Utente {
  /**
   * Identificativo univoco dell'utente.
   * Generato automaticamente dal database.
   */
  id?: number;

  /**
   * Indirizzo email utilizzato per il login.
   */
  email: string;

  /**
   * Ruolo dell'utente all'interno della piattaforma.
   *
   * - `medico`: può gestire pazienti e piani alimentari.
   * - `paziente`: può consultare i propri dati e piani.
   */
  ruolo: 'medico' | 'paziente';
}

/**
 * Informazioni anagrafiche e cliniche di un paziente.
 */
export interface Paziente {
  /**
   * Identificativo univoco del paziente.
   */
  id: number;

  /**
   * ID del medico responsabile del paziente.
   */
  medico_id: number;

  /**
   * Nome del paziente.
   */
  nome: string;

  /**
   * Cognome del paziente.
   */
  cognome: string;

  /**
   * Data di nascita.
   */
  data_nascita?: Date | string;

  /**
   * Altezza espressa in centimetri.
   */
  altezza?: number;

  /**
   * Obiettivo nutrizionale o fisico del paziente.
   *
   * Esempi:
   * - Dimagrimento
   * - Massa muscolare
   * - Mantenimento peso
   */
  obiettivo?: string;

  /**
   * Anamnesi clinica e informazioni mediche rilevanti.
   */
  anamnesi?: string;
}

/**
 * Rilevazione effettuata durante una visita di controllo.
 */
export interface Visita {
  /**
   * Identificativo univoco della visita.
   */
  id: number;

  /**
   * Paziente a cui appartiene la visita.
   */
  paziente_id: number;

  /**
   * Data della visita.
   */
  data_visita: Date;

  /**
   * Peso rilevato in chilogrammi.
   */
  peso: number;
}

/**
 * Singolo alimento presente in un pasto.
 *
 * Contiene sia la quantità consumata che i valori
 * nutrizionali associati.
 */
export interface VocePasto {
  /**
   * Identificativo della voce.
   */
  id: number;

  /**
   * ID del pasto di appartenenza.
   */
  pasto_id: number;

  /**
   * Nome dell'alimento.
   */
  alimento: string;

  /**
   * Quantità espressa in grammi.
   */
  grammi: number;

  /**
   * Apporto calorico totale della porzione.
   */
  kcal?: number;

  /**
   * Quantità di proteine in grammi.
   */
  proteine?: number;

  /**
   * Quantità di carboidrati in grammi.
   */
  carboidrati?: number;

  /**
   * Quantità di grassi in grammi.
   */
  grassi?: number;
}

/**
 * Pasto previsto in una giornata del piano alimentare.
 */
export interface Pasto {
  /**
   * Identificativo del pasto.
   */
  id: number;

  /**
   * Giorno del piano a cui appartiene il pasto.
   */
  giorno_id: number;

  /**
   * Tipologia del pasto.
   */
  tipo_pasto:
    | 'colazione'
    | 'pranzo'
    | 'cena'
    | 'spuntino';

  /**
   * Elenco degli alimenti che compongono il pasto.
   */
  voci_pasto: VocePasto[];
}

/**
 * Piano alimentare assegnato a un paziente.
 */
export interface PianoAlimentare {
  /**
   * Identificativo univoco del piano.
   */
  id: number;

  /**
   * Paziente destinatario del piano.
   */
  paziente_id: number;

  /**
   * Medico che ha creato il piano.
   */
  medico_id: number;

  /**
   * Data e ora di creazione del piano.
   */
  created_at: Date;

  /**
   * Giorni che compongono il piano alimentare.
   */
  giorni: GiornoPiano[];
}

/**
 * Rappresenta una giornata del piano alimentare.
 */
export interface GiornoPiano {
  /**
   * Identificativo del giorno.
   */
  id: number;

  /**
   * Piano alimentare di appartenenza.
   */
  piano_id: number;

  /**
   * Giorno della settimana.
   */
  giorno:
    | 'lunedi'
    | 'martedi'
    | 'mercoledi'
    | 'giovedi'
    | 'venerdi'
    | 'sabato'
    | 'domenica';

  /**
   * Elenco dei pasti previsti per la giornata.
   */
  pasti: Pasto[];
}