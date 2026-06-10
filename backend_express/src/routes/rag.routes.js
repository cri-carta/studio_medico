const express   = require('express');
const router    = express.Router();
const { spawn } = require('child_process');
const path      = require('path');
const jwt       = require('jsonwebtoken');
const { getVisiteByPaziente }                  = require('../models/visita.model');
const { getPatientById }                       = require('../models/paziente.model');
const { savePianoJSON, getPianoJSONByPaziente } = require('../models/piano.model');
const { getMedicoByUtenteId }                  = require('../models/medico.model');

const PYTHON     = 'C:\\Users\\user\\Desktop\\studio_medico\\backend_AI\\venv\\Scripts\\python.exe';
const RAG_SCRIPT = 'C:\\Users\\user\\Desktop\\studio_medico\\backend_AI\\rag_system.py';

function callPython(comando, payload) {
    return new Promise((resolve, reject) => {
        console.log('[PYTHON] Comando:', comando);
        console.log('[PYTHON] Payload:', JSON.stringify(payload).substring(0, 300));

        const proc = spawn(PYTHON, [RAG_SCRIPT, comando, JSON.stringify(payload)], {
            env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
        });

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

// GET /rag/tabella/:paziente_id — SSE
router.get('/tabella/:paziente_id', async (req, res) => {
    const token = req.query.token;
    if (!token) {
        return res.status(401).json({ error: 'Token mancante.' });
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return res.status(403).json({ error: 'Token non valido.' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const sendEvent = (tipo, dati) => {
        res.write(`event: ${tipo}\n`);
        res.write(`data: ${JSON.stringify(dati)}\n\n`);
    };

    try {
        const { paziente_id } = req.params;
        console.log('[RAG SSE] paziente_id:', paziente_id);

        const paziente = await getPatientById(paziente_id);
        if (!paziente) {
            sendEvent('errore', { message: 'Paziente non trovato.' });
            res.end();
            return;
        }

        const ragId = `paz_${String(paziente_id).padStart(3, '0')}`;
        console.log('[RAG SSE] ID formattato:', ragId);
        sendEvent('stato', { message: 'Elaborazione in corso...' });

        const risultato = await callPython('tabella', {
            domanda:     'Genera un piano nutrizionale settimanale personalizzato.',
            paziente_id: ragId,
        });

        console.log('[RAG SSE] ha_contesto:', risultato.ha_contesto);
        console.log('[RAG SSE] risposta keys:', risultato.risposta ? Object.keys(risultato.risposta) : 'null');

        // Salva il piano JSON nel DB
        if (risultato.ha_contesto && risultato.risposta && Object.keys(risultato.risposta).length > 0) {
            try {
                const medico = await getMedicoByUtenteId(decoded.id);
                const medico_id = medico ? medico.id : null;

                if (!medico_id) {
                    console.error('[RAG SSE] Medico non trovato per utente_id:', decoded.id);
                } else {
                    console.log('[RAG SSE] Salvataggio - paziente_id:', paziente_id, '| medico_id:', medico_id);
                    const saved = await savePianoJSON(paziente_id, medico_id, risultato.risposta);
                    console.log('[RAG SSE] Piano salvato nel DB:', JSON.stringify(saved));
                }
            } catch (saveErr) {
                console.error('[RAG SSE] ERRORE salvataggio:', saveErr.message);
                console.error('[RAG SSE] Stack:', saveErr.stack);
            }
        } else {
            console.warn('[RAG SSE] Salvataggio saltato - ha_contesto:', risultato.ha_contesto);
        }

        sendEvent('completo', risultato);
        res.end();

    } catch (err) {
        console.error('[RAG SSE] Errore:', err.message);
        sendEvent('errore', { message: err.message });
        res.end();
    }
});

// GET /rag/piano/:paziente_id — recupera piano salvato
router.get('/piano/:paziente_id', async (req, res) => {
    try {
        const { paziente_id } = req.params;
        const piano = await getPianoJSONByPaziente(paziente_id);

        if (!piano) {
            return res.status(404).json({ error: 'Nessun piano trovato per questo paziente.' });
        }

        res.json(piano);
    } catch (err) {
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