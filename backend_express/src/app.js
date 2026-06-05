require('dotenv').config();

const express = require('express');
const cors = require('cors');

/*
    IMPORT ROUTES
*/
const pazientiRoutes = require('./routes/pazienti.routes');
const visiteRoutes = require('./routes/visite.routes');
const pianiRoutes = require('./routes/piani.routes');

const app = express();

/*
    MIDDLEWARE
*/
app.use(cors());

app.use(express.json());

/*
    ROUTES
*/
app.use('/pazienti', pazientiRoutes);
app.use('/visite', visiteRoutes);
app.use('/piani', pianiRoutes);

/*
    TEST ROUTE
*/
app.get('/', (req, res) => {

    res.json({
        message: 'Backend nutrizione attivo'
    });

});

/*
    SERVER
*/
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(`Server avviato sulla porta ${PORT}`);

});