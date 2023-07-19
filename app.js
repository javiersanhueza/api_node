'use strict'

// Requires
const express = require('express');
const bodyParser = require('body-parser');

// Ejecutar express
const app = express();

// Cargar archivos de rutas
const userRoutes = require('./routes/user');

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// CORS

// Reescribir rutas
app.use('/api', userRoutes);

// Exportar el módulo
module.exports = app;
