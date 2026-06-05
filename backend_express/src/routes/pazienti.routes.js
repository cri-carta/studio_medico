const express = require('express');

const router = express.Router();

const {
    getPatients
} = require('../controllers/pazienti.controller');

router.get('/', getPatients);

module.exports = router;

