require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const app     = express();

// Importa le rotte
const pazientiRoutes = require('./routes/pazienti.routes');
const visiteRoutes   = require('./routes/visite.routes');
const pianiRoutes    = require('./routes/piani.routes');
const authRoutes     = require('./routes/auth.routes');
const utentiRoutes   = require('./routes/utenti.routes');
const medicoRoutes   = require('./routes/medico.routes');
const ragRoutes      = require('./routes/rag.routes');

app.use((req, res, next) => {
    console.log(`[LOG RICEVUTO]: ${req.method} ${req.url}`);
    next();
});

app.use(cors());
app.use(express.json());

// Timeout 10 minuti per chiamate RAG
app.use((req, res, next) => {
    res.setTimeout(600000);
    next();
});

// Monta le rotte
app.use('/pazienti', pazientiRoutes);
app.use('/visite',   visiteRoutes);
app.use('/piani',    pianiRoutes);
app.use('/auth',     authRoutes);
app.use('/utenti',   utentiRoutes);
app.use('/medici',   medicoRoutes);
app.use('/rag',      ragRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Backend nutrizione attivo' });
});

app.use((err, req, res, next) => {
    console.error("ERRORE RILEVATO DAL MIDDLEWARE GLOBALE:", err.stack);
    res.status(500).json({ error: 'Errore interno del server', details: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server avviato sulla porta ${PORT}`);
});