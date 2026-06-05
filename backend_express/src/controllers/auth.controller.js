const jwt = require('jsonwebtoken');

// All'interno della tua funzione di login
const login = async (req, res) => {
    const { email, password } = req.body;
    
    // 1. Recupera l'utente dal DB (pseudo-codice)
    const user = await User.findOne({ where: { email } });
    
    // 2. Verifica password (usando bcrypt, come suggerito prima)
    // if (!bcrypt.compareSync(password, user.password_hash)) { ... }

    // 3. Genera il token includendo ruolo e ID
    const token = jwt.sign(
        { 
            id: user.id, 
            ruolo: user.ruolo // 'medico' o 'paziente' preso dalla tabella 'utenti'
        }, 
        process.env.JWT_SECRET, // Assicurati di avere una chiave segreta nel file .env
        { expiresIn: '1h' }
    );

    // 4. Rispondi al client
    res.status(200).json({ 
        message: 'Login effettuato con successo',
        token: token,
        ruolo: user.ruolo 
    });
};