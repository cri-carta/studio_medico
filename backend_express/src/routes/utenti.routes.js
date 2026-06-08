const express = require('express');

const router = express.Router();

const {
    getUsers
} = require('../controllers/utenti.controller');

router.get('/', getUsers);

module.exports = router;