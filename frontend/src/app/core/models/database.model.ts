// Mappatura database studio_medico_db.sql

export interface Utente {
  id?: number;
  email: string;
  ruolo: 'medico' | 'paziente';
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

export interface Visita {
  id: number;
  paziente_id: number;
  data_visita: Date;
  peso: number;
}

export interface VocePasto {
  id: number;
  pasto_id: number;
  alimento: string;
  grammi: number;
  kcal?: number;       // DEFAULT NULL nel DB
  proteine?: number;   // DEFAULT NULL nel DB
  carboidrati?: number;// DEFAULT NULL nel DB
  grassi?: number;     // DEFAULT NULL nel DB
}

export interface Pasto {
  id: number;
  giorno_id: number;
  tipo_pasto: 'colazione' | 'pranzo' | 'cena' | 'spuntino'; // Basato sull'ENUM del DB
  voci_pasto: VocePasto[]; // Array di alimenti associati a questo pasto
}

export interface PianoAlimentare {
  id: number;
  paziente_id: number;
  medico_id: number;
  created_at: Date;
  giorni: GiornoPiano[];
}

export interface GiornoPiano {
  id: number;
  piano_id: number;
  giorno: 'lunedi' | 'martedi' | 'mercoledi' | 'giovedi' | 'venerdi' | 'sabato' | 'domenica';
  pasti: Pasto[];
}