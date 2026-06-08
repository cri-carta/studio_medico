/**
 * rag_bridge.js
 * -------------
 * Snippet di integrazione Express → rag_system.py
 * Da includere nel tuo router Express quando integrerai il backend.
 *
 * Ogni chiamata spawna il processo Python, passa il payload come argomento
 * e legge il JSON dallo stdout. Nessun HTTP interno, nessun server Python separato.
 */

const { execFile } = require("child_process");
const path = require("path");

const PYTHON  = process.env.PYTHON_BIN  || "python3";
const RAG_PY  = process.env.RAG_SCRIPT  || path.join(__dirname, "rag_system.py");
const TIMEOUT = parseInt(process.env.RAG_TIMEOUT_MS || "30000"); // 30s default

/**
 * Chiama rag_system.py con un comando e un payload.
 * Ritorna una Promise che risolve con il JSON parsato dallo stdout.
 *
 * @param {"query"|"add"|"remove"|"update"|"list"|"seed"} comando
 * @param {object} payload
 */
function callRAG(comando, payload = {}) {
  return new Promise((resolve, reject) => {
    const args = [RAG_PY, comando, JSON.stringify(payload)];

    execFile(PYTHON, args, { timeout: TIMEOUT }, (err, stdout, stderr) => {
      if (err) {
        return reject(new Error(stderr || err.message));
      }
      try {
        resolve(JSON.parse(stdout));
      } catch (parseErr) {
        reject(new Error(`Output Python non valido: ${stdout}`));
      }
    });
  });
}

// ---------------------------------------------------------------------------
// Esempio di router Express
// ---------------------------------------------------------------------------

const express = require("express");
const router  = express.Router();

// Seed dati iniziali (linee guida + alimenti)
// POST /api/rag/seed
router.post("/seed", async (req, res) => {
  try {
    const result = await callRAG("seed", {});
    res.json(result);
  } catch (e) {
    res.status(500).json({ ok: false, errore: e.message });
  }
});

// Query RAG
// POST /api/rag/query
// body: { domanda: string, paziente_id?: string }
router.post("/query", async (req, res) => {
  const { domanda, paziente_id } = req.body;
  if (!domanda) return res.status(400).json({ ok: false, errore: "Campo 'domanda' mancante." });

  try {
    const result = await callRAG("query", { domanda, paziente_id });
    res.json(result);
  } catch (e) {
    res.status(500).json({ ok: false, errore: e.message });
  }
});

// Lista pazienti
// GET /api/rag/pazienti
router.get("/pazienti", async (req, res) => {
  try {
    const result = await callRAG("list", {});
    res.json(result);
  } catch (e) {
    res.status(500).json({ ok: false, errore: e.message });
  }
});

// Aggiungi paziente
// POST /api/rag/pazienti
// body: { id, nome, eta?, peso?, altezza?, note?, kcal?, obiettivo? }
router.post("/pazienti", async (req, res) => {
  try {
    const result = await callRAG("add", req.body);
    res.json(result);
  } catch (e) {
    res.status(500).json({ ok: false, errore: e.message });
  }
});

// Aggiorna paziente
// PUT /api/rag/pazienti/:id
router.put("/pazienti/:id", async (req, res) => {
  try {
    const result = await callRAG("update", { ...req.body, id: req.params.id });
    res.json(result);
  } catch (e) {
    res.status(500).json({ ok: false, errore: e.message });
  }
});

// Rimuovi paziente
// DELETE /api/rag/pazienti/:id
router.delete("/pazienti/:id", async (req, res) => {
  try {
    const result = await callRAG("remove", { id: req.params.id });
    res.json(result);
  } catch (e) {
    res.status(500).json({ ok: false, errore: e.message });
  }
});

module.exports = router;

// Nel tuo app.js:
// const ragRouter = require("./rag_bridge");
// app.use("/api/rag", ragRouter);
