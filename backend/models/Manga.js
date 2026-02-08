const mongoose = require('mongoose');

const mangaSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  chapters: { type: Number, default: 0 },
  type: { type: String, required: true },
  genre: { type: [String], required: true },
  rating: { type: Number, min: 1, max: 10 },
  readStatus: { type: String, required: true },
  readingPlatform: { type: String },
  releaseYear: { type: Number },
  posterUrl: { type: String },
  isFavourite: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true }); // <--- THIS ENABLES THE TIMESTAMPS

module.exports = mongoose.model('Manga', mangaSchema);