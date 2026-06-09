const express   = require('express');
const router    = express.Router();
const { spawn } = require('child_process');
const path      = require('path');
const { getVisiteByPaziente } = require('../models/visita.model');
const { getPatientById }      = require('../models/paziente.model');

const PYTHON     = 'C:\\Users\\user\\Desktop\\studio_medico\\backend_AI\\venv\\Scripts\\python.exe';
const RAG_SCRIPT = 'C:\\Users\\user\\Desktop\\studio_medico\\backend_AI\\rag_system.py';

function callPython(comando, payload) {
    return new Promise((resolve, reject) => {
        console.log('[PYTHON] Comando:', comando);
        console.log('[PYTHON] Payload:', JSON.stringify(payload).substring(0, 300));

        const proc = spawn(PYTHON, [RAG_SCRIPT, comando, JSON.stringify(payload)]);

        let stdout = '';
        let stderr = '';

        proc.stdout.on('data', (data) => {
            stdout += data.toString();
            console.log('[PYTHON stdout]', data.toString().substring(0, 200));
        });
        proc.stderr.on('data', (data) => {
            stderr += data.toString();
            console.log('[PYTHON stderr]', data.toString().substring(0, 200));
        });

        proc.on('close', (code) => {
            console.log('[PYTHON] Exit code:', code);
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

// POST /rag/tabella
router.post('/tabella', async (req, res) => {
    try {
        const { paziente_id } = req.body;
        console.log('[RAG] paziente_id ricevuto:', paziente_id);

        if (!paziente_id) {
            return res.status(400).json({ error: 'Campo paziente_id obbligatorio.' });
        }

        const paziente = await getPatientById(paziente_id);
        if (!paziente) {
            return res.status(404).json({ error: 'Paziente non trovato.' });
        }

        const ragId = `paz_${String(paziente_id).padStart(3, '0')}`;
        console.log('[RAG] ID formattato:', ragId);

        const risultato = await callPython('tabella', {
            domanda:     'Genera un piano nutrizionale settimanale personalizzato.',
            paziente_id: ragId,
        });

        console.log('[RAG] ha_contesto:', risultato.ha_contesto);
        console.log('[RAG] fonti:', risultato.fonti);
        res.json(risultato);

    } catch (err) {
        console.error('[RAG] Errore tabella:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// GET /rag/analisi/:paziente_id
router.get('/analisi/:paziente_id', async (req, res) => {
    try {
        const { paziente_id } = req.params;
        console.log('[RAG] analisi per paziente_id:', paziente_id);

        const paziente = await getPatientById(paziente_id);
        if (!paziente) {
            return res.status(404).json({ error: 'Paziente non trovato.' });
        }

        const visite = await getVisiteByPaziente(paziente_id);
        console.log('[RAG] visite trovate:', visite.length);

        if (visite.length < 2) {
            return res.status(400).json({ error: 'Servono almeno 2 visite per l\'analisi.' });
        }

        const dataNascita = new Date(paziente.data_nascita);
        const eta = Math.floor((new Date() - dataNascita) / (365.25 * 24 * 60 * 60 * 1000));

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
                eta:       eta,
                obiettivo: paziente.obiettivo || 'non specificato',
            },
            visite: visteFormattate,
        });

        console.log('[RAG] analisi ha_migliorato:', risultato.ha_migliorato);
        res.json(risultato);

    } catch (err) {
        console.error('[RAG] Errore analisi:', err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;