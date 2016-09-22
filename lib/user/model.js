'use strict';

let moment = require('moment-timezone');
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let userSchema = new Schema({
  "bnetId": { type: Number, unique: true },
  "battletag": { type: String, unique: true },
  "token": { type: String, unique: true },
  "provider": String,
  "characters": [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Character'
  }],
  "isDeleted": {
    type: Boolean,
    default: false
  },
  "createdAt": Date,
  "updatedAt": Date
});

userSchema.pre('findOneAndUpdate', function(next) {
  let currentDate = moment();

  this.findOneAndUpdate({}, { $set: { updatedAt: currentDate } });

  if (!this.createdAt) {
    this.findOneAndUpdate({}, { $set: { createdAt: currentDate } });
  }

  next();
});

let User = mongoose.model('User', userSchema);

module.exports = User;
