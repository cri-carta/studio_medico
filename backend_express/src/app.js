require('dotenv').config();

const express = require('express');
const cors = require('cors');

const pazientiRoutes = require('./routes/pazienti.routes');
const visiteRoutes = require('./routes/visite.routes');
const pianiRoutes = require('./routes/piani.routes');
const authRoutes = require('./routes/auth.routes');
const utentiRoutes = require('./routes/utenti.routes');

const app = express();

app.use(cors());

app.use(express.json());

app.use('/pazienti', pazientiRoutes);

app.use('/visite', visiteRoutes);

app.use('/piani', pianiRoutes);

app.use('/auth', authRoutes);

app.use('/utenti', utentiRoutes);

app.get('/', (req, res) => {

    res.json({
        message: 'Backend nutrizione attivo'
    });

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(`Server avviato sulla porta ${PORT}`);

});