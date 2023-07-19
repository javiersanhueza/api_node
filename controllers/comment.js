'use strict'

const { validationResult, body } = require('express-validator');

const Topic = require('../models/topic');

const controller = {
  add: [
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
      const topicId = req.params.topicId;;

      // Find por id del topic
      Topic.findById(topicId).exec()
        .then(topic => {

          // En la propiedad comments del objeto resultante hace un push
          const comment = {
            user: req.user.sub,
            content: req.body.content
          };
          topic.comments.push(comment);

          // Guardar el topic completo
          topic.save()
            .then(topicSave => {
              return res.status(200).json({
                status: 'success',
                message: 'Acción realizada satisfactoriamente',
                topic: topicSave
              });
            })
            .catch(error => {
              return res.status(400).json({
                status: 'error',
                error: error,
                message: 'Error al guardar comentario'
              })
            })
        })
        .catch(error => {
          return res.status(400).json({
            status: 'error',
            error: error,
            message: 'Error al encontrar el tópico'
          });
        })
    },
  ],
  update: [
    body('content').notEmpty().withMessage('El contenido es obligatorio'),

    (req, res) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          errors: errors.array()
        });
      }

      // Conseguir el id del comentario que llega por url
      const commentId = req.params.commentId;
      const { content } = req.body;

      // Find and update de subdocumento
      Topic.findOneAndUpdate(
        { 'comments._id': commentId},
        {
          '$set': {
            "comments.$.content": content
          }
        },
        { new: true }
      )
        .then(topicUpdate => {
          return res.status(200).json({
            status: 'success',
            message: 'Acción realizada satisfactoriamente',
            topic: topicUpdate
          });
        })
        .catch(error => {
          return res.status(400).json({
            status: 'error',
            error: error,
            message: 'Error al actualizar comentario'
          })
        })
    }
  ],
  delete: (req, res) => {

    // Sacar id del topic y del comentario
    const topicId = req.params.topicId;
    const commentId = req.params.commentId;

    // Buscar el topic
    Topic.findById(topicId)
      .then(topic => {
        if (!topic) {
          return res.status(404).json({
            status: 'error',
            message: 'No se encontró el tópico'
          });
        }

        topic.comments.pull(commentId);

        // Guardar el topic
        topic.save()
          .then(topicUpdate => {
            return res.status(200).json({
              status: 'success',
              message: 'Acción realizada satisfactoriamente',
              topic: topicUpdate
            });
          })
          .catch(error => {
            return res.status(400).json({
              status: 'error',
              error: error,
              message: 'Error al guardar el tópico'
            })
          })
      })
      .catch(error => {
        return res.status(400).json({
          status: 'error',
          error: error,
          message: 'Error al encontrar el tópico'
        })
      })
  },
};

module.exports = controller;
