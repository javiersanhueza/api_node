'use strict'

const express = require('express');

const CommentController = require('../controllers/comment');
const mdAuth = require('../middlewares/auth');

const router = express.Router();

// Rutas de topic
router.post('/comment/topic/:topicId', mdAuth.auth, CommentController.add);
router.put('/comment/:commentId', mdAuth.auth, CommentController.update);
router.delete('/comment/:topicId/:commentId', mdAuth.auth, CommentController.delete);

module.exports = router;
