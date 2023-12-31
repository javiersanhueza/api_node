'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = Schema({
  name: String,
  surname: String,
  email: { type: String, unique: true },
  password: String,
  image: String,
  role: String
});

module.exports = mongoose.model('User', UserSchema);
