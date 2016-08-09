'use strict';

let moment = require('moment');
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let epgpCharacterSchema = new Schema({
  "characterId": {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Character'
  },
  "effortPoints": Number,
  "gearPoints": Number,
  "createdAt": Date,
  "updatedAt": Date
});

epgpCharacterSchema.pre('findOneAndUpdate', function(next) {
  let currentDate = moment();

  this.findOneAndUpdate({}, { $set: { updatedAt: currentDate } });

  if (!this.createdAt) {
    this.findOneAndUpdate({}, { $set: { createdAt: currentDate } });
  }

  next();
});

let EPGPCharacter = mongoose.model('EPGPCharacter', epgpCharacterSchema);

module.exports = EPGPCharacter;
