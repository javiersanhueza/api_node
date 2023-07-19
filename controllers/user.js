'use strict'

const { validationResult, body } = require('express-validator');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const User = require('../models/user');
const jwt = require('../services/jwt');

const controller = {
  test: function(req, res) {
    return res.status(200).send({
      message: 'Soy el método test'
    });
  },

  testing: function(req, res) {
    return res.status(200).send({
      message: 'Soy el método testing'
    });
  },

  save: [
    // Array de validaciones utilizando express-validator
    body('name').notEmpty().withMessage('El nombre es obligatorio'),
    body('surname').notEmpty().withMessage('El apellido es obligatorio'),
    body('email').notEmpty().withMessage('El email es obligatorio').isEmail().withMessage('El email no es válido'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria'),

    async function (req, res) {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          errors: errors.array()
        })
      }

      // Recoger los parámetros de la petición
      const body = req.body;

      // Crear objeto de usuario
      const user = new User();

      // Asignar valores al usuario
      user.name = body.name;
      user.surname = body.surname;
      user.email = body.email;
      user.role = 'ROLE_USER';
      user.image = null;

      // Comprobar si el usuario existe
      try {
        const issetUser = await User.findOne({ email: user.email });
        if (!issetUser) {
          // Cifrar contraseña
          bcrypt.hash(body.password, 10, async (err, hash) => {
            user.password = hash;

            // Guardar usuario
            try {
              const userSave = await user.save();
              console.log(userSave);
              return res.status(200).json({
                status: 'success',
                message: 'Acción realizada satisfactoriamente',
                user: userSave
              })
            } catch (error) {
              return res.status(500).json({
                status: 'error',
                message: 'Error al guardar usuario'
              })
            }
          });
        } else {
          return res.status(200).json({
            status: 'error',
            message: 'Usuario ya registrado'
          })
        }
      } catch (error) {
        return res.status(500).json({
          status: 'error',
          message: 'Error a comprobar duplicidad de usuario'
        })
      }
    }
  ],

  login: [
    body('email').notEmpty().withMessage('El email es obligatorio').isEmail().withMessage('El email no es válido'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria'),

    async (req, res) => {

      // Validar los datos
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          errors: errors.array()
        })
      }
      // Recoger los parámetros de la petición
      const { email, password, getToken } = req.body;

      // Buscar usuario que coincidan con email
      try {
        const user = await User.findOne({ email });

        if (!user) {
          return res.status(200).json({
            status: 'error',
            message: 'Usuario ya registrado'
          })
        }

        // Comprobar la contraseña(coincidencia de email y password con bcrypt)
        bcrypt.compare(password, user.password, (err, check) => {
          if (check) {
            // Generar token de jwt y devolverlo (más tarde)
            if (getToken) {
              return res.status(200).json({
                toke: jwt.createToken(user)
              })
            }
            // Limpiar el objeto
            user.password = undefined;

            // Devolver los datos del usuario
            return res.status(200).json({
              status: 'success',
              message: 'Acción realizada satisfactoriamente',
              user
            });
          }
          return res.status(200).json({
            status: 'error',
            message: 'Las credenciales no son correctas'
          })
        })
      } catch (e) {
        return res.status(500).json({
          status: 'error',
          message: 'Error al buscar el usuario'
        })
      }
    }
  ],

  update: [
    // Array de validaciones utilizando express-validator
    body('name').notEmpty().withMessage('El nombre es obligatorio'),
    body('surname').notEmpty().withMessage('El apellido es obligatorio'),
    body('email').notEmpty().withMessage('El email es obligatorio').isEmail().withMessage('El email no es válido'),

    async (req, res) => {
      // Validar los datos
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          errors: errors.array()
        })
      }

      // Recoger los datos del usuario
      const body = req.body;
      const userId = req.user.sub;

      // Buscar y actualizar usuario
      User.findByIdAndUpdate(userId, body, { new: true })
        .then(userUpdated => {
          userUpdated.password = undefined;
          return res.status(200).json({
            status: 'success',
            message: 'Acción realizada satisfactoriamente',
            user: userUpdated
          });
        })
        .catch(error => {
          return res.status(400).json({
            status: 'error',
            error: error,
            message: 'No se pudo actualizar al usuario'
          })
        })
    }
  ],

  uploadAvatar: (req, res) => {
    // Configurar el módulo multipart (middleware) routes/user.js

    // Recoger el fichero de la petición
    let fileName = 'Avatar no subido...';

    if (!req.files || !req.files.file0?.name) {
      return res.status(404).json({
        status: 'error',
        message: fileName
      });
    }

    // Conseguir el nombre y la extensión del archivo subido
    const filePath = req.files.file0.path;
    fileName = filePath.split('\\')[2];

    const extSplit = fileName.split('\.');
    const fileExt = extSplit[1];

    // Comprobar extensión (solo imágenes), si no es válida borrar fichero subido
    if (fileExt !== 'png' && fileExt !== 'jpg' && fileExt !== 'jpeg' && fileExt !== 'gif') {
      fs.unlink(filePath, (err) => {
        return res.status(200).json({
          status: 'error',
          message: 'La extensión del archivo no es válida'
        });
      })
    } else {
      // Sacar el id del usuario identificado
      const userId = req.user.sub;

      // Buscar y actualizar usuario
      User.findByIdAndUpdate(userId, { image: fileName }, { new: true })
        .then(userUpdated => {
          userUpdated.password = undefined;
          return res.status(200).json({
            status: 'success',
            message: 'Acción realizada satisfactoriamente',
            user: userUpdated
          });
        })
        .catch(error => {
          return res.status(400).json({
            status: 'error',
            error: error,
            message: 'No se pudo guardar la imagen'
          })
        })
    }
  },

  avatar: (req, res) => {
    const fileName = req.params.fileName;
    const pathFile = `./uploads/users/${fileName}`;

    console.log(pathFile);

    fs.exists(pathFile, (exists) => {
      if (exists) {
        return res.sendFile(path.resolve(pathFile));
      } else {
        return res.status(404).json({
          status: 'error',
          message: 'Imagen no existe'
        })
      }
    });
  },

  getUsers: (req, res) => {
    User.find().exec()
      .then(users => {
        return res.status(200).json({
          status: 'success',
          message: 'Acción realizada satisfactoriamente',
          users
        })
      })
      .catch(error => {
        return res.status(400).json({
          status: 'error',
          error: error,
          message: 'Error a encontrar los usuarios'
        })
      })
  },

  getUser: (req, res) => {
    const userId = req.params.id;

    User.findById(userId).exec()
      .then(user => {
        user.password = undefined;
        return res.status(200).json({
          status: 'success',
          message: 'Acción realizada satisfactoriamente',
          user
        })
      })
      .catch(error => {
        return res.status(400).json({
          status: 'error',
          error: error,
          message: 'Error a encontrar el usuario'
        })
      })
  }
};

module.exports = controller;
