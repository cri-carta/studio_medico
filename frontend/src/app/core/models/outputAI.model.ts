// Interfacce per mappare ed elaborare correttamente le risposte strutturate provenienti dallo script dell'IA

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

export interface RispostaTabellaAI {
  piano_settimanale: {
    [giorno: string]: GiornoPianoAI; // Dinamico per Lunedì, Martedì, ecc.
  };
}

export interface RispostaAnalisiAI {
  analisi: string;
  delta_peso: number;
  delta_bmi: number;
  delta_bf: number;
  ha_migliorato: boolean;
}