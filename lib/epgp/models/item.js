'use strict';

let moment = require('moment-timezone');
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let epgpItemSchema = new Schema({
  "id": String, // Can't be unique because epgp uses
  "timestamp": { type: Number }, // Can't be unique because epgp uses
  "cost": Number,                //    the same timestamp on all items from a particular boss
  "characterId": {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Character'
  },
  "itemId": {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item'
  },
  "raidId": {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EPGPRaid'
  },
  "createdAt": Date,
  "updatedAt": Date
});

epgpItemSchema.pre('findOneAndUpdate', function(next) {
  let currentDate = moment();

  this.findOneAndUpdate({}, { $set: { updatedAt: currentDate } });

  if (!this.createdAt) {
    this.findOneAndUpdate({}, { $set: { createdAt: currentDate } });
  }

  next();
});

let EPGPItem = mongoose.model('EPGPItem', epgpItemSchema);

module.exports = EPGPItem;
