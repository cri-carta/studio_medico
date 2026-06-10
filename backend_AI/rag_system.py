"""
rag_system.py
-------------
Modulo RAG per sistema nutrizionistico.
Espone SistemaRAG come classe utilizzabile da Express via child_process.

Comandi CLI:
    python rag_system.py seed     '{}'
    python rag_system.py query    '{"domanda": "...", "paziente_id": "paz_001"}'
    python rag_system.py tabella  '{"domanda": "...", "paziente_id": "paz_001"}'
    python rag_system.py analisi  '{"paziente": {...}, "visite": [...]}'
    python rag_system.py add      '{"id": "paz_001", "nome": "Mario", ...}'
    python rag_system.py remove   '{"id": "paz_001"}'
    python rag_system.py update   '{"id": "paz_001", "nome": "Mario", ...}'
    python rag_system.py list     '{}'

Dipendenze:
    pip install ollama chromadb python-dotenv
"""

import os
import json
import ollama
import chromadb
from chromadb.utils.embedding_functions import OllamaEmbeddingFunction
from dotenv import load_dotenv

load_dotenv()

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL",   "http://localhost:11434")
OLLAMA_CHAT     = os.getenv("OLLAMA_MODEL",       "llama3.2")
OLLAMA_EMBED    = os.getenv("OLLAMA_EMBED_MODEL", "nomic-embed-text")
CHROMA_PATH     = os.getenv("CHROMA_PATH", os.path.join(os.path.dirname(os.path.abspath(__file__)), "rag_db"))


# ---------------------------------------------------------------------------
# Dati seed
# ---------------------------------------------------------------------------

LINEE_GUIDA = [
    {
        "id": "lin_001",
        "testo": """LINEE GUIDA NUTRIZIONALI — OMS
        Adulti: almeno 400g di frutta e verdura al giorno.
        Zuccheri liberi: meno del 10% dell'apporto calorico totale.
        Grassi saturi: meno del 10% delle calorie giornaliere.
        Sale: meno di 5g al giorno per prevenire ipertensione.""",
        "categoria": "linee guida",
    },
    {
        "id": "lin_002",
        "testo": """LINEE GUIDA — INTOLLERANZA AL LATTOSIO
        Evitare latte vaccino, formaggi freschi, panna, burro.
        Consentiti: formaggi stagionati, yogurt fermentato, latte senza lattosio.
        Alternative vegetali: latte di soia, avena, mandorle.
        Integrare calcio con broccoli, sardine, tofu, mandorle.""",
        "categoria": "linee guida",
    },
    {
        "id": "ali_001",
        "testo": """ALIMENTI CONSIGLIATI PER IPERTENSIONE
        Privilegiare: frutta fresca, verdure a foglia verde, legumi, pesce azzurro.
        Ridurre: sale, insaccati, formaggi stagionati, cibi in scatola.
        Dieta DASH raccomandata: ricca di potassio, magnesio, calcio.
        Evitare alcol e caffeina in eccesso.""",
        "categoria": "alimenti",
    },
    {
        "id": "ali_002",
        "testo": """FONTI DI PROTEINE PER VEGETARIANI
        Legumi: lenticchie, ceci, fagioli — 18-25g di proteine per 100g secchi.
        Cereali: quinoa, amaranto — proteine complete con tutti gli aminoacidi.
        Derivati soia: tofu, tempeh, edamame.
        Integrare vitamina B12 obbligatoriamente con supplementi o alimenti fortificati.""",
        "categoria": "alimenti",
    },
    {
        "id": "lin_003",
        "testo": """LINEE GUIDA — DIETA MEDITERRANEA
        La dieta mediterranea è riconosciuta dall'UNESCO come patrimonio culturale immateriale dell'umanità.
        Base della piramide alimentare: cereali integrali (pasta, pane, riso, orzo, farro) ad ogni pasto.
        Frutta e verdura: 5 porzioni al giorno di colori diversi per massimizzare i micronutrienti.
        Legumi: almeno 3-4 volte a settimana come fonte proteica principale alternativa alla carne.
        Pesce: 2-3 volte a settimana, privilegiando pesce azzurro (sardine, sgombro, acciughe) ricco di omega-3.
        Carne rossa: massimo 1-2 volte a settimana. Carne bianca fino a 3 volte.
        Uova: 2-4 a settimana.
        Olio extravergine d'oliva: condimento principale, 2-4 cucchiai al giorno.
        Frutta secca e semi: una piccola manciata al giorno (30g).""",
        "categoria": "linee guida",
    },
    {
        "id": "pat_001",
        "testo": """GESTIONE NUTRIZIONALE — IPERTENSIONE ARTERIOSA
        Dieta DASH raccomandata: riduce la pressione sistolica di 8-14 mmHg.
        Alimenti da privilegiare: frutta fresca (banane, arance, kiwi ricchi di potassio), verdure a foglia verde,
        legumi, pesce azzurro, latticini scremati, cereali integrali.
        Alimenti da ridurre drasticamente: sale (max 5g/giorno), insaccati, formaggi stagionati,
        cibi in scatola, dadi da brodo, salse industriali, patatine, snack salati.
        Alimenti da evitare: alcol in eccesso, caffeina in eccesso, liquirizia, energy drink.
        Potassio: fondamentale — fabbisogno 3.5g/giorno. Fonti: banane, patate, fagioli, spinaci, avocado.
        Magnesio: 300-400mg/giorno. Fonti: mandorle, semi di zucca, spinaci, legumi.""",
        "categoria": "patologie",
    },
    {
        "id": "pat_002",
        "testo": """GESTIONE NUTRIZIONALE — DIABETE TIPO 2 E RESISTENZA ALL'INSULINA
        Preferire alimenti a basso indice glicemico (IG < 55).
        Carboidrati: distribuire uniformemente nei pasti, non eliminare.
        Fibre solubili: fondamentali per rallentare l'assorbimento degli zuccheri. Avena, legumi, mele, orzo.
        Alimenti consigliati: cereali integrali, legumi, verdure non amidacee, frutta a basso IG,
        pesce, carni magre, olio d'oliva.
        Alimenti da limitare: zuccheri semplici, bevande zuccherate, succhi di frutta, dolci,
        pane bianco, riso bianco, patate, frutta tropicale.
        Pasti: 3 pasti principali + 1-2 spuntini leggeri per mantenere stabile la glicemia.""",
        "categoria": "patologie",
    },
    {
        "id": "pat_003",
        "testo": """GESTIONE NUTRIZIONALE — INTOLLERANZA AL LATTOSIO
        Molti intolleranti tollerano fino a 12g di lattosio al giorno.
        Alimenti da evitare: latte vaccino fresco, formaggi freschi (ricotta, mozzarella, stracchino),
        panna, burro in grandi quantità, gelato cremoso.
        Alimenti generalmente tollerati: formaggi stagionati (parmigiano, grana, pecorino),
        yogurt fermentato, latte delattosato, burro chiarificato.
        Alternative vegetali: latte di soia, avena, mandorla, riso, cocco.
        Calcio alternativo: broccoli, cavolo riccio, sardine con lische, tofu con calcio, mandorle.""",
        "categoria": "patologie",
    },
    {
        "id": "pat_004",
        "testo": """GESTIONE NUTRIZIONALE — CELIACHIA E SENSIBILITÀ AL GLUTINE
        Dieta assolutamente priva di glutine per tutta la vita.
        Cereali vietati: frumento, farro, kamut, orzo, segale, triticale.
        Cereali consentiti: riso, mais, grano saraceno, quinoa, amaranto, miglio, sorgo, teff, patate.
        Rischio contaminazione crociata: usare utensili e superfici separate.
        Carenze nutrizionali frequenti: ferro, folati, vitamina B12, calcio, vitamina D.""",
        "categoria": "patologie",
    },
    {
        "id": "pat_005",
        "testo": """GESTIONE NUTRIZIONALE — SINDROME DEL COLON IRRITABILE (IBS)
        Dieta a basso contenuto di FODMAP spesso efficace.
        Alimenti ad alto FODMAP da limitare: aglio, cipolla, mele, pere, miele, latte,
        legumi in grandi quantità, grano, cavolfiore, funghi, avocado.
        Alimenti a basso FODMAP tollerati: riso, avena, carote, zucchine, patate, pomodori,
        arance, fragole, mirtilli, carne, pesce, uova, tofu, formaggio stagionato.""",
        "categoria": "patologie",
    },
    {
        "id": "pat_006",
        "testo": """GESTIONE NUTRIZIONALE — IPERCOLESTEROLEMIA
        Grassi saturi da ridurre: carni grasse, burro, formaggi grassi, olio di palma.
        Grassi trans da eliminare: margarine solide, prodotti industriali idrogenati.
        Grassi insaturi consigliati: olio extravergine d'oliva, avocado, frutta secca, pesce grasso.
        Omega-3: pesce azzurro 2-3 volte/settimana, semi di lino, noci.
        Fibre solubili: beta-glucani dell'avena riducono il colesterolo LDL. 3g/giorno di
        beta-glucani riducono il colesterolo del 5%.
        Legumi: 1 porzione al giorno riduce LDL del 5%.""",
        "categoria": "patologie",
    },
    {
        "id": "stile_001",
        "testo": """ALIMENTAZIONE VEGETARIANA
        Nutrienti critici da monitorare: vitamina B12, ferro, zinco, omega-3, iodio.
        Proteine complete: combinare cereali + legumi per tutti gli aminoacidi essenziali.
        Fonti proteiche: uova, formaggi, yogurt, latte, legumi, quinoa, amaranto, frutta secca.
        Ferro: potenziare con vitamina C nello stesso pasto.
        Omega-3: semi di lino, semi di chia, noci, olio di lino.""",
        "categoria": "stili alimentari",
    },
    {
        "id": "stile_002",
        "testo": """ALIMENTAZIONE VEGANA
        Integrazioni quasi sempre necessarie: vitamina B12 (obbligatoria), vitamina D3,
        omega-3 DHA+EPA da alghe, iodio.
        Calcio: tofu con calcio, bevande vegetali arricchite, cavolo riccio, broccoli, mandorle.
        Proteine: quinoa, amaranto, soia, combinazioni cereali-legumi.
        Monitoraggio: esami ematici ogni 6-12 mesi per B12, D, ferro, ferritina, zinco.""",
        "categoria": "stili alimentari",
    },
    {
        "id": "stile_003",
        "testo": """ALIMENTAZIONE — PERDITA DI PESO GRADUALE
        Perdita sana: 0.5-1 kg a settimana — deficit calorico di 500-1000 kcal/giorno.
        Non scendere sotto 1200 kcal/giorno per le donne, 1500 kcal per gli uomini.
        Proteine: aumentare a 1.2-1.6g/kg per preservare la massa muscolare.
        Sazietà: privilegiare verdure, legumi, frutta, cereali integrali, proteine magre.
        Evitare: diete drastiche sotto 800 kcal, eliminazione di interi macronutrienti.
        Idratazione: bere 500ml di acqua prima dei pasti riduce l'assunzione calorica del 13%.""",
        "categoria": "stili alimentari",
    },
    {
        "id": "stile_004",
        "testo": """ALIMENTAZIONE — MANTENIMENTO DEL PESO
        Fabbisogno calorico basale (BMR) — formula di Mifflin-St Jeor:
        Uomini: (10 x peso kg) + (6.25 x altezza cm) - (5 x età) + 5
        Donne: (10 x peso kg) + (6.25 x altezza cm) - (5 x età) - 161
        Moltiplicatori attività: sedentario x1.2, leggermente attivo x1.375,
        moderatamente attivo x1.55, molto attivo x1.725.
        Strategia: 50% carboidrati, 25% proteine, 25% grassi come punto di partenza.""",
        "categoria": "stili alimentari",
    },
    {
        "id": "micro_001",
        "testo": """VITAMINA B12
        Fabbisogno: 2.4 microgrammi/giorno adulti.
        Fonti animali: fegato bovino, vongole, sardine, salmone, manzo, uova, latte, parmigiano.
        Fonti vegetali: nessuna fonte affidabile — integrazione obbligatoria per vegani.
        Carenza: anemia megaloblastica, danni neurologici, stanchezza cronica.""",
        "categoria": "micronutrienti",
    },
    {
        "id": "micro_002",
        "testo": """VITAMINA D
        Livelli ottimali: 25-OH-D3 nel sangue tra 40-60 ng/mL.
        Sintesi cutanea: 20-30 minuti di esposizione solare su viso e braccia.
        Fonti alimentari: salmone, sgombro, sardine, olio di fegato di merluzzo, tuorlo d'uovo.
        Integrazione spesso necessaria: 1000-2000 UI/giorno in autunno-inverno.""",
        "categoria": "micronutrienti",
    },
    {
        "id": "micro_003",
        "testo": """OMEGA-3
        Fabbisogno EPA+DHA: almeno 250mg/giorno per adulti sani.
        Fonti EPA+DHA: salmone, sgombro, sardine, acciughe, aringa, tonno fresco, cozze.
        Fonti ALA vegetali: semi di lino, semi di chia, noci, olio di lino.
        Per vegani: integratore di olio di alghe.""",
        "categoria": "micronutrienti",
    },
    {
        "id": "pasti_001",
        "testo": """ORGANIZZAZIONE DEI PASTI — COLAZIONE
        Colazione ottimale: carboidrati complessi + proteine + grassi buoni + fibre.
        Esempi equilibrati: porridge di avena con frutta e noci, yogurt greco con granola e frutti di bosco,
        pane integrale con uova e avocado.
        Colazione sbagliata: solo caffè e cornetto, solo succo di frutta, biscotti industriali.""",
        "categoria": "pasti",
    },
    {
        "id": "pasti_002",
        "testo": """ORGANIZZAZIONE DEI PASTI — PRANZO E CENA
        Piatto ideale: 50% verdure, 25% proteine magre, 25% carboidrati integrali.
        Pranzo tipico: pasta integrale con legumi, riso con verdure e proteina, insalata di quinoa.
        Cena: preferire pasti leggeri. Cenare almeno 2-3 ore prima di dormire.
        Digiuno notturno: intervallo di 12 ore tra cena e colazione benefico per il metabolismo.""",
        "categoria": "pasti",
    },
    {
        "id": "pasti_003",
        "testo": """SPUNTINI E GESTIONE DELLA FAME
        Spuntini sani: frutta + frutta secca, yogurt greco + frutti di bosco,
        hummus + verdure crude, pane integrale + avocado.
        Dimensioni: non superare 150-200 kcal per spuntino.
        Pre-workout: banana + burro di mandorle, 30-60 min prima.
        Post-workout: proteine + carboidrati entro 30-60 min. Es: yogurt greco + frutta.""",
        "categoria": "pasti",
    },
    {
        "id": "sport_001",
        "testo": """NUTRIZIONE SPORTIVA — PRINCIPI GENERALI
        Carboidrati: 5-7g/kg/giorno per sport di endurance, 3-5g/kg per sport di forza.
        Proteine: 1.4-1.7g/kg/giorno per sport di forza, 1.2-1.6g/kg per endurance.
        Dose ottimale per pasto: 20-40g di proteine.
        Idratazione: reintegrare 1.5 volte il peso perso in sudore durante l'allenamento.
        Elettroliti: per sessioni oltre 60-90 minuti reintegrare sodio, potassio e magnesio.""",
        "categoria": "sport",
    },
    {
        "id": "sport_002",
        "testo": """NUTRIZIONE SPORTIVA — TIMING DEI NUTRIENTI
        Pre-allenamento (2-3 ore prima): carboidrati complessi + proteine moderate + grassi bassi.
        Pre-allenamento (30-60 min prima): spuntino leggero a prevalenza carboidrati semplici.
        Durante allenamento (oltre 60 min): 30-60g di carboidrati per ora.
        Post-allenamento entro 30-60 min: ratio ottimale 3-4g carboidrati : 1g proteine.
        Prima di dormire: yogurt greco o caseina per migliorare il recupero notturno.""",
        "categoria": "sport",
    },

    
]


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def _build_testo_paziente(dati: dict) -> str:
    """Costruisce il testo indicizzabile dal dizionario paziente."""
    righe = [f"PAZIENTE: {dati['nome']}"]
    if dati.get("eta"):       righe.append(f"Età: {dati['eta']} anni.")
    if dati.get("peso"):      righe.append(f"Peso: {dati['peso']} kg.")
    if dati.get("altezza"):   righe.append(f"Altezza: {dati['altezza']} cm.")
    if dati.get("note"):      righe.append(dati["note"])
    if dati.get("kcal"):      righe.append(f"Piano calorico: {dati['kcal']} kcal/giorno.")
    if dati.get("obiettivo"): righe.append(f"Obiettivo: {dati['obiettivo']}.")
    return "\n".join(righe)


# ---------------------------------------------------------------------------
# Classe principale
# ---------------------------------------------------------------------------

class SistemaRAG:

    def __init__(
        self,
        n_risultati:       int   = 3,
        soglia_similarita: float = 0.50,
        chat_model:        str   = OLLAMA_CHAT,
        embedding_model:   str   = OLLAMA_EMBED,
        chroma_path:       str   = CHROMA_PATH,
    ):
        self.n_risultati       = n_risultati
        self.soglia_similarita = soglia_similarita
        self.chat_model        = chat_model

        embedding_fn = OllamaEmbeddingFunction(
            url        = f"{OLLAMA_BASE_URL}/api/embeddings",
            model_name = embedding_model,
        )

        chroma = chromadb.PersistentClient(path=chroma_path)
        collection_kwargs = dict(
            embedding_function = embedding_fn,
            metadata           = {"hnsw:space": "cosine"},
        )

        self.col_pazienti   = chroma.get_or_create_collection("pazienti",   **collection_kwargs)
        self.col_conoscenza = chroma.get_or_create_collection("conoscenza", **collection_kwargs)

    # ------------------------------------------------------------------
    # Chunking
    # ------------------------------------------------------------------

    def _chunking(self, testo: str, chunk_size: int = 60, overlap: int = 15) -> list[str]:
        """Divide il testo in chunk sovrapposti."""
        parole = testo.split()
        chunks, i = [], 0
        while i < len(parole):
            chunk = " ".join(parole[i : i + chunk_size])
            chunks.append(chunk)
            i += chunk_size - overlap
        return chunks

    def _indicizza_in(self, collection, documenti: list[dict]) -> int:
        """Indicizza una lista di documenti in una collezione ChromaDB."""
        ids, testi, metadati = [], [], []
        for doc in documenti:
            chunks = self._chunking(doc["testo"])
            for j, chunk in enumerate(chunks):
                ids.append(f"{doc['id']}_chunk_{j}")
                testi.append(chunk)
                metadati.append({
                    "doc_id":    doc["id"],
                    "chunk_idx": j,
                    "categoria": doc.get("categoria", "generale"),
                })
        if ids:
            collection.upsert(ids=ids, documents=testi, metadatas=metadati)
        return len(ids)

    # ------------------------------------------------------------------
    # Seed
    # ------------------------------------------------------------------

    def seed_conoscenza(self) -> int:
        """Indicizza le linee guida nella collezione conoscenza."""
        return self._indicizza_in(self.col_conoscenza, LINEE_GUIDA)

    # ------------------------------------------------------------------
    # CRUD pazienti
    # ------------------------------------------------------------------

    def aggiungi_paziente(self, dati: dict) -> dict:
        """Aggiunge o aggiorna un paziente nel vector DB."""
        if not dati.get("id") or not dati.get("nome"):
            return {"ok": False, "errore": "Campi 'id' e 'nome' obbligatori."}
        testo = _build_testo_paziente(dati)
        doc   = {"id": dati["id"], "testo": testo, "categoria": "paziente"}
        n     = self._indicizza_in(self.col_pazienti, [doc])
        return {"ok": True, "id": dati["id"], "chunks": n}

    def rimuovi_paziente(self, paziente_id: str) -> dict:
        """Rimuove tutti i chunk di un paziente dal vector DB."""
        risultati = self.col_pazienti.get(where={"doc_id": paziente_id}, include=[])
        ids_da_rimuovere = risultati["ids"]
        if not ids_da_rimuovere:
            return {"ok": False, "errore": f"Paziente '{paziente_id}' non trovato."}
        self.col_pazienti.delete(ids=ids_da_rimuovere)
        return {"ok": True, "rimossi": len(ids_da_rimuovere)}

    def aggiorna_paziente(self, dati: dict) -> dict:
        """Aggiorna un paziente rimuovendo e reindicizzando."""
        self.rimuovi_paziente(dati["id"])
        return self.aggiungi_paziente(dati)

    def lista_pazienti(self) -> list[dict]:
        """Ritorna la lista dei pazienti nel DB."""
        tutti = self.col_pazienti.get(include=["documents", "metadatas"])
        visti = {}
        for doc_id, testo, meta in zip(tutti["ids"], tutti["documents"], tutti["metadatas"]):
            pid = meta.get("doc_id", doc_id)
            if pid not in visti:
                visti[pid] = testo[:80] + "..."
        return [{"id": k, "anteprima": v} for k, v in visti.items()]

    # ------------------------------------------------------------------
    # Retrieval
    # ------------------------------------------------------------------

    def _retrieval_da(self, collection, query: str) -> list[dict]:
        """Retrieval su una singola collezione con filtro soglia similarità."""
        try:
            n = min(self.n_risultati, collection.count())
            if n == 0:
                return []
            risultati = collection.query(
                query_texts=[query],
                n_results=n,
                include=["documents", "distances", "metadatas"],
            )
        except Exception as e:
            print(f"[WARN] Retrieval error: {e}")
            return []

        filtrati = []
        for doc, dist, meta in zip(
            risultati["documents"][0],
            risultati["distances"][0],
            risultati["metadatas"][0],
        ):
            similarita = 1.0 - dist
            if similarita >= self.soglia_similarita:
                filtrati.append({
                    "testo":      doc,
                    "similarita": round(similarita, 3),
                    "categoria":  meta.get("categoria", "N/A"),
                    "doc_id":     meta.get("doc_id", "N/A"),
                })
        return filtrati

    def retrieval(self, query: str, solo_paziente_id: str = None) -> list[dict]:
        """Retrieval combinato su entrambe le collezioni."""
        risultati = self._retrieval_da(self.col_conoscenza, query)
        if solo_paziente_id:
            tutti_paz = self._retrieval_da(self.col_pazienti, query)
            risultati += [r for r in tutti_paz if r["doc_id"] == solo_paziente_id]
        else:
            risultati += self._retrieval_da(self.col_pazienti, query)
        risultati.sort(key=lambda x: x["similarita"], reverse=True)
        return risultati[: self.n_risultati * 2]

    # ------------------------------------------------------------------
    # Generazione — risposta testuale libera
    # ------------------------------------------------------------------

    def _genera_risposta(self, query: str, contesto: list[dict]) -> dict:
        """Genera una risposta testuale basata sul contesto."""
        if not contesto:
            return {
                "risposta":    "Non ho trovato informazioni rilevanti per rispondere.",
                "fonti":       [],
                "similarita":  [],
                "ha_contesto": False,
            }

        contesto_str = "\n\n".join([
            f"[Fonte {i+1} — {c['categoria']} | doc: {c['doc_id']} | sim: {c['similarita']:.0%}]:\n{c['testo']}"
            for i, c in enumerate(contesto)
        ])

        prompt = f"""Rispondi alla domanda basandoti ESCLUSIVAMENTE sul contesto fornito.
Se le informazioni non sono sufficienti, dillo esplicitamente.

CONTESTO:
{contesto_str}

DOMANDA: {query}

RISPOSTA:"""

        try:
            response = ollama.chat(
                model    = self.chat_model,
                messages = [
                    {
                        "role":    "system",
                        "content": (
                            "Sei un assistente nutrizionista preciso e affidabile. "
                            "Rispondi sempre in italiano, in modo chiaro e conciso."
                        ),
                    },
                    {"role": "user", "content": prompt},
                ],
                options={"temperature": 0.1, "num_predict": 600},
            )
            testo_risposta = response["message"]["content"]
        except Exception as e:
            testo_risposta = f"Errore nella generazione della risposta: {str(e)}"

        return {
            "risposta":    testo_risposta,
            "fonti":       [c["categoria"] for c in contesto],
            "doc_ids":     [c["doc_id"]    for c in contesto],
            "similarita":  [c["similarita"] for c in contesto],
            "ha_contesto": True,
        }

    # ------------------------------------------------------------------
    # Generazione — tabella nutrizionale settimanale
    # ------------------------------------------------------------------

    def _genera_tabella(self, query: str, contesto: list[dict]) -> dict:
        """Genera un piano alimentare settimanale in formato JSON."""
        if not contesto:
            return {
                "risposta":    {},
                "fonti":       [],
                "ha_contesto": False,
            }

        contesto_str = "\n\n".join([
            f"[Fonte {i+1} — {c['categoria']} | doc: {c['doc_id']}]:\n{c['testo']}"
            for i, c in enumerate(contesto)
        ])

        schema_richiesto = {
            "piano_settimanale": {
                "Lunedì": {
                    "pasti": {
                        "Colazione": [{"alimento": "Nome alimento", "grammatura": "Xg"}],
                        "Pranzo":    [{"alimento": "Nome alimento", "grammatura": "Xg"}],
                        "Merenda":   [{"alimento": "Nome alimento", "grammatura": "Xg"}],
                        "Cena":      [{"alimento": "Nome alimento", "grammatura": "Xg"}]
                    },
                    "totale_giornaliero": {
                        "calorie_totali": 1800,
                        "carboidrati_g":  200,
                        "grassi_g":       60,
                        "proteine_g":     115
                    }
                },
                "Martedì":   "...",
                "Mercoledì": "...",
                "Giovedì":   "...",
                "Venerdì":   "...",
                "Sabato":    "...",
                "Domenica":  "..."
            }
        }

        prompt = f"""Basandoti ESCLUSIVAMENTE sul contesto fornito, genera un piano nutrizionale settimanale completo (da Lunedì a Domenica).
Rispetta rigorosamente i limiti calorici, le intolleranze e i cibi consigliati/da evitare presenti nel contesto.

CONTESTO:
{contesto_str}

DOMANDA: {query}

RISPONDI ESCLUSIVAMENTE IN FORMATO JSON seguendo esattamente questa struttura:
{json.dumps(schema_richiesto, ensure_ascii=False, indent=2)}"""

        try:
            response = ollama.chat(
                model    = self.chat_model,
                format   = "json",
                messages = [
                    {
                        "role":    "system",
                        "content": (
                            "Sei un assistente nutrizionista preciso. Generi piani alimentari "
                            "settimanali strutturati in JSON basandoti solo sui dati del contesto. "
                            "Per ogni giorno includi nell'ordine: Colazione, Pranzo, Merenda, Cena. "
                            "Calcola accuratamente i macro totali e le calorie a fine giornata."
                        ),
                    },
                    {"role": "user", "content": prompt},
                ],
                options={"temperature": 0.1, "num_predict": 4096},
            )
            tabella_json = json.loads(response["message"]["content"])
        except Exception as e:
            tabella_json = {"errore": f"Errore nella generazione o parsing del JSON: {str(e)}"}

        return {
            "risposta":    tabella_json,
            "fonti":       [c["categoria"] for c in contesto],
            "doc_ids":     [c["doc_id"]    for c in contesto],
            "similarita":  [c["similarita"] for c in contesto],
            "ha_contesto": True,
        }

    # ------------------------------------------------------------------
    # Generazione — analisi andamento
    # ------------------------------------------------------------------

    def analisi_andamento(self, paziente: dict, visite: list[dict]) -> dict:
        """Analizza l'andamento del paziente su tutte le visite."""
        if len(visite) < 2:
            return {"ok": False, "errore": "Servono almeno 2 visite per l'analisi."}

        visite_str = ""
        for i, v in enumerate(visite):
            visite_str += f"\nVisita {i+1} ({v['data_visita']}):\n"
            visite_str += f"  - Peso: {v['peso']} kg\n"
            visite_str += f"  - BMI:  {v['bmi']}\n"
            visite_str += f"  - BF:   {v['bf']}%\n"

        prima      = visite[0]
        ultima     = visite[-1]
        delta_peso = round(ultima['peso'] - prima['peso'], 1)
        delta_bmi  = round(ultima['bmi']  - prima['bmi'],  2)
        delta_bf   = round(ultima['bf']   - prima['bf'],   1)

        prompt = f"""Sei un nutrizionista. Analizza l'andamento completo di questo paziente nel tempo.

PAZIENTE: {paziente['nome']} {paziente['cognome']}, {paziente['eta']} anni
OBIETTIVO: {paziente.get('obiettivo', 'non specificato')}

STORICO VISITE:
{visite_str}

VARIAZIONE TOTALE (prima → ultima visita):
- Peso: {delta_peso:+.1f} kg
- BMI:  {delta_bmi:+.2f}
- BF:   {delta_bf:+.1f}%

Fornisci:
1. Valutazione generale dell'andamento nel tempo (positivo/negativo/altalenante/stabile)
2. Analisi dettagliata di ogni parametro con riferimento alle singole visite
3. Eventuali anomalie o inversioni di tendenza
4. Consigli pratici per il proseguimento
Rispondi in italiano, in modo professionale ma comprensibile."""

        try:
            response = ollama.chat(
                model    = self.chat_model,
                messages = [
                    {
                        "role":    "system",
                        "content": "Sei un nutrizionista esperto. Rispondi sempre in italiano."
                    },
                    {"role": "user", "content": prompt},
                ],
                options={"temperature": 0.3, "num_predict": 1000},
            )
            testo = response["message"]["content"]
        except Exception as e:
            testo = f"Errore generazione analisi: {str(e)}"

        return {
            "analisi":       testo,
            "n_visite":      len(visite),
            "delta_peso":    delta_peso,
            "delta_bmi":     delta_bmi,
            "delta_bf":      delta_bf,
            "ha_migliorato": delta_peso <= 0 and delta_bf <= 0
        }

    # ------------------------------------------------------------------
    # Pipeline completa
    # ------------------------------------------------------------------

    def query(self, domanda: str, paziente_id: str = None) -> dict:
        """Pipeline completa retrieval + generazione risposta testuale."""
        contesto  = self.retrieval(domanda, solo_paziente_id=paziente_id)
        risultato = self._genera_risposta(domanda, contesto)
        return risultato

    def genera_tabella(self, domanda: str, paziente_id: str = None) -> dict:
        """Pipeline completa retrieval + generazione piano alimentare."""
        contesto  = self.retrieval(domanda, solo_paziente_id=paziente_id)
        risultato = self._genera_tabella(domanda, contesto)
        return risultato


# ---------------------------------------------------------------------------
# Entry point CLI
# ---------------------------------------------------------------------------

def main():
    import sys

    if len(sys.argv) < 3:
        print(json.dumps({"ok": False, "errore": "Uso: rag_system.py <comando> '<json>'"}))
        sys.exit(1)

    comando = sys.argv[1]
    try:
        payload = json.loads(sys.argv[2])
    except json.JSONDecodeError as e:
        print(json.dumps({"ok": False, "errore": f"JSON non valido: {e}"}))
        sys.exit(1)

    rag = SistemaRAG()

    if comando == "seed":
        n = rag.seed_conoscenza()
        print(json.dumps({"ok": True, "chunks_indicizzati": n}))

    elif comando == "query":
        domanda     = payload.get("domanda", "")
        paziente_id = payload.get("paziente_id")
        if not domanda:
            print(json.dumps({"ok": False, "errore": "Campo 'domanda' mancante."}))
        else:
            print(json.dumps(rag.query(domanda, paziente_id=paziente_id), ensure_ascii=False))

    elif comando == "tabella":
        domanda     = payload.get("domanda", "Genera un piano nutrizionale settimanale.")
        paziente_id = payload.get("paziente_id")
        print(json.dumps(rag.genera_tabella(domanda, paziente_id=paziente_id), ensure_ascii=False))

    elif comando == "analisi":
        paziente = payload.get("paziente")
        visite   = payload.get("visite")
        if not paziente or not visite:
            print(json.dumps({"ok": False, "errore": "Campi 'paziente' e 'visite' obbligatori."}))
        else:
            print(json.dumps(rag.analisi_andamento(paziente, visite), ensure_ascii=False))

    elif comando == "add":
        print(json.dumps(rag.aggiungi_paziente(payload), ensure_ascii=False))

    elif comando == "remove":
        pid = payload.get("id")
        if not pid:
            print(json.dumps({"ok": False, "errore": "Campo 'id' mancante."}))
        else:
            print(json.dumps(rag.rimuovi_paziente(pid), ensure_ascii=False))

    elif comando == "update":
        print(json.dumps(rag.aggiorna_paziente(payload), ensure_ascii=False))

    elif comando == "list":
        print(json.dumps({"ok": True, "pazienti": rag.lista_pazienti()}, ensure_ascii=False))

    else:
        print(json.dumps({"ok": False, "errore": f"Comando sconosciuto: '{comando}'"}))
        sys.exit(1)


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "test":
        rag = SistemaRAG()

        print("--- SEED ---")
        print(rag.seed_conoscenza())

        print("--- ADD ---")
        print(rag.aggiungi_paziente({
            "id":        "paz_001",
            "nome":      "Mario Rossi",
            "eta":       45,
            "peso":      92,
            "note":      "Intollerante al lattosio. Ipertensione lieve.",
            "kcal":      1800
        }))

        print("--- TABELLA ---")
        print(rag.genera_tabella(
            "Genera piano nutrizionale settimanale.",
            paziente_id="paz_001"
        ))

        print("--- ANALISI ---")
        print(rag.analisi_andamento(
            paziente = {"nome": "Mario", "cognome": "Rossi", "eta": 45},
            visite   = [
                {"data_visita": "2024-01-01", "peso": 92.0, "bmi": 29.5, "bf": 28.0},
                {"data_visita": "2024-02-01", "peso": 90.5, "bmi": 28.9, "bf": 26.5},
                {"data_visita": "2024-04-01", "peso": 89.0, "bmi": 28.4, "bf": 25.8},
                {"data_visita": "2024-06-01", "peso": 87.0, "bmi": 27.8, "bf": 24.5},
            ]
        ))

    else:
        main()