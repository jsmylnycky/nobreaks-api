'use strict';

let moment = require('moment-timezone');
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let guildSchema = new Schema({
  "name": { type: String, unique: true},
  "realm": String,
  "battlegroup": String,
  "level": Number,
  "side": Number,
  "achievementPoints": Number,
  "emblem": {
    "icon": Number,
    "iconColor":String ,
    "border": Number,
    "borderColor": String,
    "backgroundColor": String
  },
  "createdAt": Date,
  "updatedAt": Date
});

guildSchema.pre('findOneAndUpdate', function(next) {
  let currentDate = moment();

  this.findOneAndUpdate({}, { $set: { updatedAt: currentDate } });

  if (!this.createdAt) {
    this.findOneAndUpdate({}, { $set: { createdAt: currentDate } });
  }

  next();
});

let Guild = mongoose.model('Guild', guildSchema);

module.exports = Guild;
