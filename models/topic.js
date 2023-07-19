'use strict'

const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const Schema = mongoose.Schema;

// Modelo de COMMENT
const CommentSchema = Schema({
  content: String,
  date: { type: Date, default: Date.now },
  user: { type: Schema.Types.ObjectId, ref: 'User' }
});

// Modelo de TOPIC
const TopicSchema = Schema({
  title: String,
  content: String,
  code: String,
  lang: String,
  date: { type: Date, default: Date.now },
  user: { type: Schema.ObjectId, ref: 'User' },
  comments: [CommentSchema]
});

// Carga paginación
TopicSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Topic', TopicSchema);
