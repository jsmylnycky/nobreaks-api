'use strict';

let moment = require('moment-timezone');
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let epgpRaidSchema = new Schema({
  "raidDate": { type: String, unique: true},
  "guildId": {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guild'
  },
  "createdAt": Date,
  "updatedAt": Date
});

epgpRaidSchema.pre('findOneAndUpdate', function(next) {
  let currentDate = moment();

  this.findOneAndUpdate({}, { $set: { updatedAt: currentDate } });

  if (!this.createdAt) {
    this.findOneAndUpdate({}, { $set: { createdAt: currentDate } });
  }

  next();
});

let EPGPRaid = mongoose.model('EPGPRaid', epgpRaidSchema);

module.exports = EPGPRaid;
