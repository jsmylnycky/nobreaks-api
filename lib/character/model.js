'use strict';

let moment = require('moment');
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
  "createdAt": Date,
  "updatedAt": Date
});

characterSchema.pre('findOneAndUpdate', function(next) {
  let currentDate = moment();

  this.findOneAndUpdate({}, { $set: { updatedAt: currentDate } });

  if (!this.createdAt) {
    this.findOneAndUpdate({}, { $set: { createdAt: currentDate } });
  }

  next();
});

let Character = mongoose.model('Character', characterSchema);

module.exports = Character;
