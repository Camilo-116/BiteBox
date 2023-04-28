import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

// Creacion del app
const app = express();

// Conexión a MongoDB usando mongoose
mongoose
  .connect(
    'mongodb://127.0.0.1:27017/BiteBox',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log('Connected.');
  })
  .catch((err) => {
    console.log('There was an error with connection!');
    console.log(err);
  });

// Middlewares
app.use(cors());
app.use(express.json());

import biteboxRoutes from './routes/bitebox.routes'
app.use('/bitebox', biteboxRoutes)

// Endpoint para 404
app.use((req, res) => {
  res.status(404).json({ message: 'This path might not be what you\'re looking for.' });
});

// Inicia app en puerto 8080
app.listen(8080);
