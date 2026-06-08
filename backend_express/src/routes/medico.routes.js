const express = require('express');
const router  = express.Router();
const {
    getMedici,
    getMedico,
    createMedico,
    updateMedico,
    deleteMedico
} = require('../controllers/medico.controller');

router.get('/',     getMedici);
router.get('/:id',  getMedico);
router.post('/',    createMedico);
router.put('/:id',  updateMedico);
router.delete('/:id', deleteMedico);

module.exports = router;