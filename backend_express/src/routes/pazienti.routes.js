const express = require('express');

const router = express.Router();

const {
    getPatients,
    getPatientsByDoctor,
    getPatientByUtenteId,
    createPatient,
    updatePatient,
    deletePatient
} = require('../controllers/pazienti.controller');

router.get('/utente/:utenteId', getPatientByUtenteId);

router.get('/', getPatients);

router.get('/medico/:id', getPatientsByDoctor);

router.post('/', createPatient);

router.put('/:id', updatePatient);

router.delete('/:id', deletePatient);

module.exports = router;

