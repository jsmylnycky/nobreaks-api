'use strict';

let moment = require('moment-timezone');
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let epgpImportSchema = new Schema({
  "data": String,
  "timestamp": { type: Number, unique: true},
  "guildId": {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guild'
  },
  "createdAt": Date,
  "updatedAt": Date
});

epgpImportSchema.pre('findOneAndUpdate', function(next) {
  let currentDate = moment();

  this.findOneAndUpdate({}, { $set: { updatedAt: currentDate } });

  if (!this.createdAt) {
    this.findOneAndUpdate({}, { $set: { createdAt: currentDate } });
  }

  next();
});

let EPGPImport = mongoose.model('EPGPImport', epgpImportSchema);

module.exports = EPGPImport;
