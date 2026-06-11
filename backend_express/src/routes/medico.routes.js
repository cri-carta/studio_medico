const express = require('express');
const router  = express.Router();
const {
    getMedici,
    getMedico,
    createMedico,
    updateMedico,
    deleteMedico
} = require('../controllers/medico.controller');

router.get('/', getMedici);

router.get('/me', async (req, res) => {
    try {
        const jwt = require('jsonwebtoken');
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { getMedicoByUtenteId } = require('../models/medico.model');
        const medico = await getMedicoByUtenteId(decoded.id);
        if (!medico) return res.status(404).json({ error: 'Medico non trovato' });
        res.json(medico);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id',    getMedico);
router.post('/',      createMedico);
router.put('/:id',    updateMedico);
router.delete('/:id', deleteMedico);

module.exports = router;