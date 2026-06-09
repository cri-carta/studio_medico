export interface VoceAlimento {
  alimento: string;
  grammatura: string;
}

export interface GiornoPianoAI {
  pasti: {
    Colazione?: VoceAlimento[];
    Pranzo?: VoceAlimento[];
    Merenda?: VoceAlimento[];
    Cena?: VoceAlimento[];
  };
  totale_giornaliero: {
    calorie_totali: number;
    carboidrati_g: number;
    grassi_g: number;
    proteine_g: number;
  };
}

export interface PianoSettimanaleAI {
  piano_settimanale: {
    [giorno: string]: GiornoPianoAI;
  };
}

export interface RispostaTabellaAI {
  risposta: PianoSettimanaleAI;
  fonti: string[];
  doc_ids: string[];
  similarita: number[];
  ha_contesto: boolean;
}

export interface RispostaAnalisiAI {
  analisi: string;
  delta_peso: number;
  delta_bmi: number;
  delta_bf: number;
  ha_migliorato: boolean;
}