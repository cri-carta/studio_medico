const express = require('express');

const router = express.Router();

const {
    getPatients,
    createPatient,
    updatePatient
} = require('../controllers/pazienti.controller');

router.get('/', getPatients);

router.post('/', createPatient);

router.put('/:id', updatePatient);

module.exports = router;

