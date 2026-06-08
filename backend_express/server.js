const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Ciao da Express!');
});

const visiteRoutes = require('./routes/visite.routes');
const ragRoutes    = require('./routes/rag.routes');

app.use('/api/visite', visiteRoutes);
app.use('/api/rag',    ragRoutes);

app.listen(3000, () => {
    console.log('Server avviato su http://localhost:3000');
});