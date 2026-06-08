const express    = require('express');
const router     = express.Router();
const { spawn }  = require('child_process');
const path       = require('path');
const { getVisiteByPaziente } = require('../models/visita.model');
const { getPatientById }      = require('../models/paziente.model');

const PYTHON     = path.join(__dirname, '../..', 'backend_AI', 'venv', 'Scripts', 'python.exe');
const RAG_SCRIPT = path.join(__dirname, '../..', 'backend_AI', 'rag_system.py');

// Helper — chiama Python e restituisce il risultato come Promise
function callPython(comando, payload) {
    return new Promise((resolve, reject) => {
        const proc = spawn(PYTHON, [RAG_SCRIPT, comando, JSON.stringify(payload)]);

        let stdout = '';
        let stderr = '';

        proc.stdout.on('data', (data) => { stdout += data.toString(); });
        proc.stderr.on('data', (data) => { stderr += data.toString(); });

        proc.on('close', (code) => {
            if (code !== 0) {
                return reject(new Error(`Python error: ${stderr}`));
            }
            try {
                resolve(JSON.parse(stdout));
            } catch (e) {
                reject(new Error(`JSON parse error: ${stdout}`));
            }
        });
    });
}

// POST /api/rag/tabella
// Body: { paziente_id: number }
router.post('/tabella', async (req, res) => {
    try {
        const { paziente_id } = req.body;

        if (!paziente_id) {
            return res.status(400).json({ error: 'Campo paziente_id obbligatorio.' });
        }

        const paziente = await getPatientById(paziente_id);
        if (!paziente) {
            return res.status(404).json({ error: 'Paziente non trovato.' });
        }

        const risultato = await callPython('tabella', {
            domanda:     'Genera un piano nutrizionale settimanale personalizzato.',
            paziente_id: `paz_${paziente_id}`,
        });

        res.json(risultato);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/rag/analisi/:paziente_id
router.get('/analisi/:paziente_id', async (req, res) => {
    try {
        const { paziente_id } = req.params;

        const paziente = await getPatientById(paziente_id);
        if (!paziente) {
            return res.status(404).json({ error: 'Paziente non trovato.' });
        }

        const visite = await getVisiteByPaziente(paziente_id);
        if (visite.length < 2) {
            return res.status(400).json({ error: 'Servono almeno 2 visite per l\'analisi.' });
        }

        // Formatta le date per Python
        const visteFormattate = visite.map(v => ({
            data_visita: v.data_visita.toISOString().split('T')[0],
            peso:        v.peso,
            bmi:         v.bmi,
            bf:          v.bf,
        }));

        const risultato = await callPython('analisi', {
            paziente: {
                nome:      paziente.nome,
                cognome:   paziente.cognome,
                eta:       paziente.eta,
                obiettivo: paziente.obiettivo || 'non specificato',
            },
            visite: visteFormattate,
        });

        res.json(risultato);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;