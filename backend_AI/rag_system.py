"""
rag_system.py
-------------
Modulo RAG per sistema nutrizionistico.
Espone SistemaRAG come classe utilizzabile da Express via child_process.

Comandi CLI:
    python rag_system.py seed     '{}'
    python rag_system.py query    '{"domanda": "...", "paziente_id": "paz_001"}'
    python rag_system.py tabella  '{"domanda": "...", "paziente_id": "paz_001"}'
    python rag_system.py analisi  '{"paziente": {...}, "prima_visita": {...}, "ultima_visita": {...}}'
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

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL",  "http://localhost:11434")
OLLAMA_CHAT     = os.getenv("OLLAMA_MODEL",      "llama3.2")
OLLAMA_EMBED    = os.getenv("OLLAMA_EMBED_MODEL", "nomic-embed-text")
CHROMA_PATH     = os.getenv("CHROMA_PATH",        "./rag_db")


# ---------------------------------------------------------------------------
# Dati seed
# ---------------------------------------------------------------------------

LINEE_GUIDA = [
    {
        "id": "lin_001",
        "testo": """LINEE GUIDA NUTRIZIONALI — OMS
        Adulti: almeno 400g di frutta e verdura al giorno.
        Zuccheri liberi: meno del 10 percento dell'apporto calorico totale.
        Grassi saturi: meno del 10 percento delle calorie giornaliere.
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
]


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def _build_testo_paziente(dati: dict) -> str:
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

        self.col_pazienti   = chroma.get_or_create_collection("pazienti",    **collection_kwargs)
        self.col_conoscenza = chroma.get_or_create_collection("conoscenza",  **collection_kwargs)

    # ------------------------------------------------------------------
    # Chunking
    # ------------------------------------------------------------------

    def _chunking(self, testo: str, chunk_size: int = 60, overlap: int = 15) -> list[str]:
        parole = testo.split()
        chunks, i = [], 0
        while i < len(parole):
            chunk = " ".join(parole[i : i + chunk_size])
            chunks.append(chunk)
            i += chunk_size - overlap
        return chunks

    def _indicizza_in(self, collection, documenti: list[dict]) -> int:
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
        return self._indicizza_in(self.col_conoscenza, LINEE_GUIDA)

    # ------------------------------------------------------------------
    # CRUD pazienti
    # ------------------------------------------------------------------

    def aggiungi_paziente(self, dati: dict) -> dict:
        if not dati.get("id") or not dati.get("nome"):
            return {"ok": False, "errore": "Campi 'id' e 'nome' obbligatori."}
        testo = _build_testo_paziente(dati)
        doc   = {"id": dati["id"], "testo": testo, "categoria": "paziente"}
        n     = self._indicizza_in(self.col_pazienti, [doc])
        return {"ok": True, "id": dati["id"], "chunks": n}

    def rimuovi_paziente(self, paziente_id: str) -> dict:
        risultati = self.col_pazienti.get(where={"doc_id": paziente_id}, include=[])
        ids_da_rimuovere = risultati["ids"]
        if not ids_da_rimuovere:
            return {"ok": False, "errore": f"Paziente '{paziente_id}' non trovato."}
        self.col_pazienti.delete(ids=ids_da_rimuovere)
        return {"ok": True, "rimossi": len(ids_da_rimuovere)}

    def aggiorna_paziente(self, dati: dict) -> dict:
        self.rimuovi_paziente(dati["id"])
        return self.aggiungi_paziente(dati)

    def lista_pazienti(self) -> list[dict]:
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
                model  = self.chat_model,
                format = "json",
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
    # Generazione — analisi andamento paziente
    # ------------------------------------------------------------------

    def analisi_andamento(self, paziente: dict, prima_visita: dict, ultima_visita: dict) -> dict:
        delta_peso = ultima_visita['peso'] - prima_visita['peso']
        delta_bmi  = ultima_visita['bmi']  - prima_visita['bmi']
        delta_bf   = ultima_visita['bf']   - prima_visita['bf']

        prompt = f"""Sei un nutrizionista. Analizza l'andamento di questo paziente.

PAZIENTE: {paziente['nome']} {paziente['cognome']}, {paziente['eta']} anni
OBIETTIVO: {paziente.get('obiettivo', 'non specificato')}

PRIMA VISITA ({prima_visita['data_visita']}):
- Peso: {prima_visita['peso']} kg
- BMI:  {prima_visita['bmi']}
- BF:   {prima_visita['bf']}%

ULTIMA VISITA ({ultima_visita['data_visita']}):
- Peso: {ultima_visita['peso']} kg
- BMI:  {ultima_visita['bmi']}
- BF:   {ultima_visita['bf']}%

VARIAZIONI:
- Peso: {delta_peso:+.1f} kg
- BMI:  {delta_bmi:+.2f}
- BF:   {delta_bf:+.1f}%

Fornisci:
1. Valutazione generale dell'andamento (positivo/negativo/stabile)
2. Analisi dettagliata di ogni parametro
3. Consigli pratici per il proseguimento
Rispondi in italiano, in modo professionale ma comprensibile."""

        try:
            response = ollama.chat(
                model    = self.chat_model,
                messages = [
                    {"role": "system", "content": "Sei un nutrizionista esperto. Rispondi sempre in italiano."},
                    {"role": "user",   "content": prompt},
                ],
                options={"temperature": 0.3, "num_predict": 800},
            )
            testo = response["message"]["content"]
        except Exception as e:
            testo = f"Errore generazione analisi: {str(e)}"

        return {
            "analisi":       testo,
            "delta_peso":    round(delta_peso, 1),
            "delta_bmi":     round(delta_bmi, 2),
            "delta_bf":      round(delta_bf, 1),
            "ha_migliorato": delta_peso <= 0 and delta_bf <= 0
        }

    # ------------------------------------------------------------------
    # Pipeline completa
    # ------------------------------------------------------------------

    def query(self, domanda: str, paziente_id: str = None) -> dict:
        contesto  = self.retrieval(domanda, solo_paziente_id=paziente_id)
        risultato = self._genera_risposta(domanda, contesto)
        return risultato

    def genera_tabella(self, domanda: str, paziente_id: str = None) -> dict:
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
        paziente      = payload.get("paziente")
        prima_visita  = payload.get("prima_visita")
        ultima_visita = payload.get("ultima_visita")
        if not paziente or not prima_visita or not ultima_visita:
            print(json.dumps({"ok": False, "errore": "Campi 'paziente', 'prima_visita', 'ultima_visita' obbligatori."}))
        else:
            print(json.dumps(rag.analisi_andamento(paziente, prima_visita, ultima_visita), ensure_ascii=False))

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
            "id": "paz_001",
            "nome": "Mario Rossi",
            "eta": 45,
            "peso": 92,
            "note": "Intollerante al lattosio. Ipertensione lieve.",
            "kcal": 1800
        }))

        print("--- TABELLA ---")
        print(rag.genera_tabella("Genera piano nutrizionale settimanale.", paziente_id="paz_001"))

        print("--- ANALISI ---")
        print(rag.analisi_andamento(
            paziente      = {"nome": "Mario", "cognome": "Rossi", "eta": 45},
            prima_visita  = {"data_visita": "2024-01-01", "peso": 92, "bmi": 29.5, "bf": 28.0},
            ultima_visita = {"data_visita": "2024-06-01", "peso": 87, "bmi": 27.8, "bf": 24.5},
        ))

    else:
        main()