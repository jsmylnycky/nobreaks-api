'use strict';

let moment = require('moment');
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let itemSchema = new Schema({
  "itemString": { type: String, unique: true},
  "item": Schema.Types.Mixed,
  "isDeleted": {
    type: Boolean,
    default: false
  },
  "createdAt": Date,
  "updatedAt": Date
});

itemSchema.pre('findOneAndUpdate', function(next) {
  let currentDate = moment();

  this.findOneAndUpdate({}, { $set: { updatedAt: currentDate } });

  if (!this.createdAt) {
    this.findOneAndUpdate({}, { $set: { createdAt: currentDate } });
  }

  next();
});

let Item = mongoose.model('Item', itemSchema);

module.exports = Item;
