const express = require('express');
const app = express();

app.use(express.json()); // necessario per leggere il body delle POST/PUT

app.get('/', (req, res) => {
  res.send('Ciao da Express!');
});

const visiteRoutes = require('./routes/visite.routes');
app.use('/api/visite', visiteRoutes);

app.listen(3000, () => {
  console.log('Server avviato su http://localhost:3000');
});