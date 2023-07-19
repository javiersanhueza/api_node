'use strict'

const express = require('express');

const UserController = require('../controllers/user');
const mdAuth = require('../middlewares/auth');

const router = express.Router();

const multipart = require('connect-multiparty');
const mdUpload = multipart({
  uploadDir: './uploads/users'
});

// Rutas de prueba
router.get('/test', UserController.test);
router.get('/testing', UserController.testing);

// Rutas de usuario
router.post('/register', UserController.save);
router.post('/login', UserController.login);
router.put('/update', mdAuth.auth, UserController.update);
router.post('/upload-avatar', [mdAuth.auth, mdUpload], UserController.uploadAvatar);
router.get('/avatar/:fileName', UserController.avatar);
router.get('/users', UserController.getUsers);
router.get('/user/:id', UserController.getUser);

module.exports = router;
