
// Path: src/controllers/auth.controller.js

// auth.controller.js
// Gestisce la registrazione, il login e il recupero utenti
// per il sistema di autenticazione dello Studio Medico


// Libreria per criptare e verificare le password
const bcrypt = require('bcrypt');

// Libreria per generare e verificare i token JWT
const jwt = require('jsonwebtoken');

// Modello utente: contiene le query al database per gli utenti
const UserModel = require('../models/utente.model');


// ------------------------------------------------------------
// REGISTER
// Registra un nuovo utente (paziente o medico) nel sistema
// Controlla se l'email è già in uso, cripta la password
// e salva il nuovo utente nel database
// ------------------------------------------------------------
async function register(req, res) {

    try {

        // Estrae email, password e ruolo dal corpo della richiesta
        const {
            email,
            password,
            ruolo
        } = req.body;

        // Controlla se esiste già un utente con la stessa email
        const existingUser =
            await UserModel.findUserByEmail(email);

        // Se l'utente esiste già, restituisce un errore 400
        if (existingUser) {

            return res.status(400).json({
                error: 'Utente già esistente'
            });

        }

        // Cripta la password con bcrypt usando 10 round di hashing
        const password_hash =
            await bcrypt.hash(password, 10);

        // Crea il nuovo utente nel database con email, password criptata e ruolo
        const result =
            await UserModel.createUser(
                email,
                password_hash,
                ruolo
            );

        // Risponde con successo (201 Created) e l'ID del nuovo utente
        res.status(201).json({

            message: 'Utente registrato',

            id: result.insertId

        });

    } catch (error) {

        // Errore interno del server: restituisce il messaggio di errore
        res.status(500).json({
            error: error.message
        });

    }
}


// ------------------------------------------------------------
// LOGIN
// Autentica un utente esistente verificando email e password
// Se le credenziali sono valide, genera e restituisce un token
// JWT con durata di 24 ore
// ------------------------------------------------------------
async function login(req, res) {

    try {

        // Estrae email e password dal corpo della richiesta
        const {
            email,
            password
        } = req.body;

        // Cerca l'utente nel database tramite email
        const user =
            await UserModel.findUserByEmail(email);

        // Log di debug per capire il fallimento del login
        console.log(`[AUTH LOGIN] login tentativo email=${email} userFound=${!!user}`);

        // Se l'utente non esiste, restituisce errore 401 (non autorizzato)
        if (!user) {
            return res.status(401).json({
                error: 'Credenziali non valide'
            });
        }

        // Confronta la password inserita con quella criptata nel database
        const validPassword =
            await bcrypt.compare(
                password,
                user.password_hash
            );

        // Se la password è errata, restituisce errore 401 (non autorizzato)
        if (!validPassword) {
            console.log(`[AUTH LOGIN] password errata per email=${email}`);
            return res.status(401).json({
                error: 'Credenziali non valide'
            });
        }
        const secretKey = process.env.JWT_SECRET || 'chiave_segreta_molto_lunga_e_sicura';
        // Genera il token JWT contenente id, email e ruolo dell'utente
        // Il token scade dopo 24 ore
        const token = jwt.sign(
            {
                id:    user.id,
                email: user.email,
                role:  user.ruolo    // ← era 'ruolo', ora 'role'
            },
            secretKey,  // Chiave segreta letta dalle variabili d'ambiente
            { expiresIn: '24h' }
        );

        // Risponde con successo inviando il token al client
        res.json({

            message: 'Login effettuato',

            token

        });

    } catch (error) {

        // Errore interno del server: restituisce il messaggio di errore
        res.status(500).json({
            error: error.message
        });

    }
}


// ------------------------------------------------------------
// GET USERS
// Restituisce la lista di tutti gli utenti registrati
// Accessibile solo agli utenti con privilegi di amministratore/medico
// ------------------------------------------------------------
async function getUsers(req, res) {

    try {

        // Recupera tutti gli utenti dal database
        const users =
            await UserModel.getAllUsers();

        // Risponde con la lista degli utenti in formato JSON
        res.json(users);

    } catch (error) {

        // Errore interno del server: restituisce il messaggio di errore
        res.status(500).json({
            error: error.message
        });

    }
}


// Esporta le funzioni del controller per essere usate nelle rotte
module.exports = {
    register,
    login,
    getUsers
};