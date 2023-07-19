'use strict'

const express = require('express');

const TopicController = require('../controllers/topic');
const mdAuth = require('../middlewares/auth');

const router = express.Router();

// Rutas de prueba
router.get('/test-topic', TopicController.test);

// Rutas de topic
router.post('/topic', mdAuth.auth, TopicController.save);
router.get('/topics/:page?', TopicController.getTopics);
router.get('/user-topics/:user', TopicController.getTopicsByUser);
router.get('/topic/:id', TopicController.getTopic);
router.put('/topic/:id', mdAuth.auth, TopicController.update);
router.delete('/topic/:id', mdAuth.auth, TopicController.deleteTopic);

module.exports = router;
