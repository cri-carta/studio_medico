const express = require('express');

const router = express.Router();

const {
    getPatients,
    createPatient
} = require('../controllers/pazienti.controller');

router.get('/', getPatients);

router.post('/', createPatient);

module.exports = router;

