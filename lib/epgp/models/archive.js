'use strict';

let moment = require('moment');
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let epgpArchiveSchema = new Schema({
  "data": String,
  "raidDate": Date,
  "guildId": {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guild'
  },
  "createdAt": Date,
  "updatedAt": Date
});

epgpArchiveSchema.pre('findOneAndUpdate', function(next) {
  let currentDate = moment();

  this.findOneAndUpdate({}, { $set: { updatedAt: currentDate } });

  if (!this.createdAt) {
    this.findOneAndUpdate({}, { $set: { createdAt: currentDate } });
  }

  next();
});

let EPGPArchive = mongoose.model('EPGPArchive', epgpArchiveSchema);

module.exports = EPGPArchive;
