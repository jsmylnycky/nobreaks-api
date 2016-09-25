'use strict';

let epgpService = require('./service');
let epgpUploader = require('./upload');
let guildService = require('../guild/service');

function getEPGP(req, res) {
  epgpService
    .getEPGP(req.guild._id, req.params.characterName)
    .then((epgpData) => {
      res.send(epgpData);
    }, (error) => {
      res.status(400).send(error);
    });
}

function getLoot(req, res) {
  epgpService
    .getLoot(req.guild._id, req.params.raidDate)
    .then((loot) => {
      res.send(loot);
    }, (error) => {
      res.status(400).send(error);
    })
}

function getMembersEPGP(req, res) {
  epgpService
    .getMembersEPGP(req.guild._id, req.query.ranks)
    .then((epgpData) => {
      res.send(epgpData);
    }, (error) => {
      res.status(400).send(error);
    });
}

function getRaidersEPGP(req, res) {
  epgpService
    .getRaidersEPGP(req.guild._id)
    .then((epgpData) => {
      res.send(epgpData);
    }, (error) => {
      res.status(400).send(error);
    });
}

function uploadEPGP(req, res, next) {
  epgpUploader
    .importEPGP(req.guild._id, req.body.epgpData)
    .then((importObj) => {
      res.send({status: 200, message: 'Import successful'});
    }, (error) => {
      next({status: 400, message: error});
    });
};

module.exports = {
  getEPGP: getEPGP,
  getLoot: getLoot,
  getMembersEPGP: getMembersEPGP,
  getRaidersEPGP: getRaidersEPGP,
  uploadEPGP: uploadEPGP
};
