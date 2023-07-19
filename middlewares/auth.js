'use strict'

const jwt = require('jwt-simple');
const SECRET = 'clave-secreta-para-generar-token-123123'

exports.auth = (req, res, next) => {
  // Comprobar si llega authorization
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(403).json({
      status: 'error',
      message: 'La petición no tiene la cabecera de authorization'
    })
  }

  // Limpiar el token y quitar comillas
  const token = authorization.replace(/['"]+/g, '');

  let payload;
  try {
    // Decodificar token
    payload = jwt.decode(token, SECRET);

  } catch (e) {
    if (e.message === 'Token expired') {
      return res.status(404).json({
        status: 'error',
        message: 'El token ha expirado'
      })
    }
    return res.status(404).json({
      status: 'error',
      message: 'El token no es válido'
    })
  }

  // Adjuntar usuario identificado a la request
  req.user = payload;

  // Pasar a la acción
  next();
};
