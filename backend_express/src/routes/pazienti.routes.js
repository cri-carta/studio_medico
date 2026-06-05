const express = require('express');

const router = express.Router();

const {
    getPatients,
    createPatient,
    updatePatient,
    deletePatient
} = require('../controllers/pazienti.controller');

router.get('/', getPatients);

router.post('/', createPatient);

router.put('/:id', updatePatient);

router.delete('/:id', deletePatient);

module.exports = router;

