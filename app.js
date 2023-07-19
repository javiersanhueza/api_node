'use strict'

// Requires
const express = require('express');
const bodyParser = require('body-parser');

// Ejecutar express
const app = express();

// Cargar archivos de rutas
const userRoutes = require('./routes/user');
const topicRoutes = require('./routes/topic');
const commentRoutes = require('./routes/comment');

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// CORS

// Reescribir rutas
app.use('/api', userRoutes);
app.use('/api', topicRoutes);
app.use('/api', commentRoutes);

// Exportar el módulo
module.exports = app;
