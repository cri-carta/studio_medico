
//Path: src/controllers/utenti.controller.js

// ============================================================
// Gestisce il recupero degli utenti registrati nel sistema
// dello Studio Medico.
// Per la registrazione e il login degli utenti, vedere
// auth.controller.js.
// ============================================================

// Modello utente: contiene le query al database per gli utenti
const UserModel = require('../models/utente.model');


// ------------------------------------------------------------
// GET USERS
// Restituisce la lista di tutti gli utenti registrati nel sistema.
// Accessibile tipicamente solo da utenti con ruolo 'medico'.
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


// Esporta la funzione del controller per essere usata nelle rotte
module.exports = {
    getUsers
};