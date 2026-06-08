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
        const utente = await Utente.findUserByEmail(email);
        
        if (!utente) {
            console.log("Login fallito: Utente non trovato");
            return res.status(401).json({ message: 'Credenziali non valide' });
        }

        const isMatch = await bcrypt.compare(password, utente.password_hash);
        
        if (!isMatch) {
            console.log("Login fallito: Password errata per", email);
            return res.status(401).json({ message: 'Credenziali non valide' });
        }

        // Se arriva qui, il login è ok
        res.status(200).json({ message: 'Login riuscito', userId: utente.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
module.exports = router;