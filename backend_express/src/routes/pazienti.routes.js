const express = require('express');

const router = express.Router();

const {
    getPatients,
    getPatientByUtenteId,
    createPatient,
    updatePatient,
    deletePatient
} = require('../controllers/pazienti.controller');

router.get('/', getPatients);
router.get('/utente/:utenteId', getPatientByUtenteId);

router.post('/', createPatient);

router.put('/:id', updatePatient);

router.delete('/:id', deletePatient);

module.exports = router;

