'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let characterSchema = new Schema({
  "name": { type: String, unique: true},
  "class": Number,
  "race": Number,
  "gender": Number,
  "level": Number,
  "achievementPoints": Number,
  "thumbnail": String,
  "calcClass": String,
  "rank": Number,
  "items": {
    "averageItemLevel": Number,
    "averageItemLevelEquipped": Number
  },
  "created_at": Date,
  "updated_at": Date
});

characterSchema.pre('save', (next) => {
  let currentDate = new Date();

  this.update_at = currentDate;

  if (!this.created_at) {
    this.created_at = currentDate;
  }

  next();
});

let Character = mongoose.model('Character', characterSchema);

module.exports = Character;
