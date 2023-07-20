'use strict'

const { validationResult, body } = require('express-validator');

const Topic = require('../models/topic');

const controller = {
  test: (req, res) => {
    return res.status(200).json({
      message: 'Hola que tal!!'
    })
  },

  save: [
    // Validar datos
    body('title').notEmpty().withMessage('El título es obligatorio'),
    body('content').notEmpty().withMessage('El contenido es obligatorio'),

    (req, res) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          errors: errors.array()
        })
      }
      // Recoger los parámetros por post
      const body = req.body;

      // Crear objeto a guardar
      const topic = new Topic();

      // Asignar valores
      topic.title = body.title;
      topic.content = body.content;
      topic.code = body.code;
      topic.lang = body.lang;
      topic.user = req.user.sub;

      // Guardar el topic
      topic.save()
        .then(topicSave => {
          return res.status(200).json({
            status: 'success',
            message: 'Acción realizada satisfactoriamente',
            topic: topicSave
          })
        })
        .catch(error => {
          return res.status(500).json({
            status: 'error',
            message: 'Error al guardar usuario',
            error
          })
        })
    }
  ],

  getTopics: (req, res) => {
    // Carga la librería de paginación en la clase (Modelo)

    // Recoger la página actual
    const page = parseInt(req.params.page, 10) || 1;

    // Indicar las opciones de paginación
    const options = {
      sort: { date: -1 },
      populate: {
        path: 'user',
        select: '-password'
      },
      limit: 5,
      page: page
    };

    // Find paginado
    Topic.paginate({}, options)
      .then(topics => {
        // Devolver resultado (topic, total de documentos, total de página)
        return res.status(200).json({
          status: 'success',
          message: 'Acción realizada satisfactoriamente',
          topics: topics.docs,
          totalDocs: topics.totalDocs,
          totalPages: topics.totalPages
        })
      })
      .catch(error => {
        return res.status(500).json({
          status: 'error',
          message: 'Error al guardar usuario',
          error
        })
      })
  },

  getTopicsByUser: (req, res) => {
    // Conseguir el id del usuario
    const userId = req.params.user;

    // Hacer un find con una condición de usuario
    Topic.find({ user: userId })
      .sort([['date', 'descending']])
      .exec()
      .then(topics => {
        return res.status(200).json({
          status: 'success',
          message: 'Acción realizada satisfactoriamente',
          topics
        })
      })
      .catch(error => {
        return res.status(400).json({
          status: 'error',
          error: error,
          message: 'Error a encontrar los topics'
        })
      })
  },

  getTopic: (req, res) => {
    // Obtener id topic de la url
    const topicId = req.params.id;

    // Find por id del topic
    Topic.findById(topicId)
      .populate({
        path: 'user',
        select: '-password'
      })
      .exec()
      .then(topics => {
        return res.status(200).json({
          status: 'success',
          message: 'Acción realizada satisfactoriamente',
          topics
        });
      })
      .catch(error => {
        return res.status(400).json({
          status: 'error',
          error: error,
          message: 'Error a encontrar el tópico'
        });
      });
  },

  update: [
    // Validar datos
    body('title').notEmpty().withMessage('El título es obligatorio'),
    body('content').notEmpty().withMessage('El contenido es obligatorio'),

    (req, res) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          errors: errors.array()
        });
      }
      // Recoger el id del topic de la url
      const topicId = req.params.id;
      const userId = req.user.sub;

      // Recoger los datos que llegan desde post
      const body = req.body;

      // Montar un json con los datos modificables
      const updateTopic = {
        title: body.title,
        content: body.content,
        code: body.code,
        lang: body.lang
      };

      // Find and update del topic y por id de usuario
      Topic.findOneAndUpdate({ _id: topicId, user: userId }, updateTopic, { new: true })
        .then(topic => {
          return res.status(200).json({
            status: 'success',
            message: 'Acción realizada satisfactoriamente',
            topic
          });
        })
        .catch(error => {
          return res.status(400).json({
            status: 'error',
            error: error,
            message: 'Error al eliminar tópico'
          })
        })
    }
  ],

  deleteTopic: (req, res) => {
    // Sacar el id del topic de la url
    const topicId = req.params.id;
    const userId = req.user.sub;

    // Find and delete por topicID y por userID
    Topic.findOneAndDelete({ _id: topicId, user: userId})
      .then(topic => {
        return res.status(200).json({
          status: 'success',
          message: 'Acción realizada satisfactoriamente',
          topic
        });
      })
      .catch(error => {
        return res.status(400).json({
          status: 'error',
          error: error,
          message: 'Error al eliminar tópico'
        })
      })
  },

  search: (req, res) => {
    // Sacar string a buscar de la url
    const searchString = req.params.search;

    // Find or
    Topic.find({
      '$or': [
        { 'title': { '$regex': searchString, '$options': 'i' } },
        { 'content': { '$regex': searchString, '$options': 'i' } },
        { 'code': { '$regex': searchString, '$options': 'i' } },
        { 'lang': { '$regex': searchString, '$options': 'i' } }
      ]
    })
      .sort([['date', 'descending']])
      .exec()
      .then(topics => {
        return res.status(200).json({
          status: 'success',
          message: 'Acción realizada satisfactoriamente',
          topics
        });
      })
      .catch(error => {
        return res.status(400).json({
          status: 'error',
          error: error,
          message: 'Error al eliminar tópico'
        })
      })
    // Devolver el resultado
  }
}

module.exports = controller;
