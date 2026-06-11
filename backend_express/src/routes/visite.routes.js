const express = require('express');
const router = express.Router();
const {
    getAllVisits,
    getVisiteByPaziente,
    getPrimaUltimaVisita,
    createVisita,
    updateVisita,
    deleteVisita
} = require('../models/visita.model');

// GET tutte le visite
router.get('/', async (req, res) => {
    try {
        const visite = await getAllVisits();
        res.json(visite);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET visite di un paziente
router.get('/paziente/:paziente_id', async (req, res) => {
    try {
        const visite = await getVisiteByPaziente(req.params.paziente_id);
        res.json(visite);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET prima e ultima visita (per analisi andamento)
router.get('/paziente/:paziente_id/andamento', async (req, res) => {
    try {
        const visite = await getPrimaUltimaVisita(req.params.paziente_id);
        if (visite.length < 2) {
            return res.status(400).json({ error: 'Servono almeno 2 visite per l\'analisi.' });
        }
        res.json({ prima: visite[0], ultima: visite[1] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST nuova visita
// POST nuova visita
router.post('/', async (req, res) => {
    try {
        const { paziente_id, data_visita, peso, bmi, bf, note_visita } = req.body;

        // Prende medico_id dal token JWT
        const jwt = require('jsonwebtoken');
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const { getMedicoByUtenteId } = require('../models/medico.model');
        const medico = await getMedicoByUtenteId(decoded.id);

        if (!medico) {
            return res.status(403).json({ error: 'Medico non trovato per questo utente.' });
        }

        const result = await createVisita(paziente_id, medico.id, data_visita, peso, bmi, bf, note_visita);
        res.status(201).json({ ok: true, id: result.insertId });

    } catch (err) {
        console.error('[VISITE POST] Errore:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// PUT aggiorna visita
router.put('/:id', async (req, res) => {
    try {
        // Estrai anche note_visita dal body
        const { data_visita, peso, bmi, bf, note_visita } = req.body;
        
        // Passalo alla funzione del modello
        await updateVisita(req.params.id, data_visita, peso, bmi, bf, note_visita);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE visita
router.delete('/:id', async (req, res) => {
    try {
        await deleteVisita(req.params.id);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;