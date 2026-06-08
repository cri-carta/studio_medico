const express = require('express');
const router = express.Router();
const Utente = require('../models/utente.model');
const bcrypt = require('bcryptjs');

// Questa riga mancava completamente nel tuo file!
router.post('/register', async (req, res) => {
    try {
        const { email, password, ruolo } = req.body;

        // 1. Controlliamo se l'utente esiste già
        const existingUser = await Utente.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email già registrata' });
        }

        // 2. Hash della password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Salvataggio
        const result = await Utente.createUser(email, hashedPassword, ruolo);

        res.status(201).json({ 
            message: 'Utente creato correttamente', 
            userId: result.insertId 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Cerca l'utente nel DB
        const utente = await Utente.findUserByEmail(email);
        if (!utente) {
            return res.status(401).json({ message: 'Credenziali non valide' });
        }

        // 2. Confronta la password inserita con l'hash nel DB
        const isMatch = await bcrypt.compare(password, utente.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenziali non valide' });
        }

        // 3. Login riuscito (per ora restituiamo un successo)
        res.status(200).json({ 
            message: 'Login effettuato con successo',
            userId: utente.id,
            ruolo: utente.ruolo 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
module.exports = router;