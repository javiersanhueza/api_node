'use strict'

const mongoose = require('mongoose');
const app = require('./app');
const port = process.env.PORT || 8080;

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/api_rest_node', { useNewUrlParser: true })
  .then(() => {
    console.log('La conexión a la base de datos de mongo se ha realizado correctamente')

    // Crear el servidor
    app.listen(port, () => {
      console.log(`El servidor está corriendo en http://localhost:${port}`);
    })
  })
  .catch((error) => console.log(error));

