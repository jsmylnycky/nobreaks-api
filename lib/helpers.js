'use strict';
let conf = require('../nobreaks.conf.json');

function buildGetUrl(path, params) {
  return conf.battlenet.host + path + '?' + objectToQueryString(Object.assign({}, params || {}, {apikey: conf.battlenet.key}));
}

function isAdminAuthenticated(req, res, next) {
  if (req.headers.authorization === conf.epgp.apiKey) {
    return next();
  }

  return res.status(401).send('Invalid Admin Token');
}

function objectToQueryString(json) {
  return Object.keys(json).map((key) => {
    let val = json[key];

    if (val.constructor.toString().indexOf('Object') != -1) {
      val = JSON.stringify(val);
    }
    return encodeURIComponent(key) + '=' + encodeURIComponent(val);
  }).join('&');
}

function parseFetchResponse(response) {
  //if (response.status >= 400) {
  //  throw new Error("Bad response from server");
  //}
  return response.json();
}

function sleep(milliseconds) {
  let start = new Date().getTime();
  for (let i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds) {
      break;
    }
  }
}

module.exports = {
  buildGetUrl: buildGetUrl,
  isAdminAuthenticated: isAdminAuthenticated,
  objectToQueryString: objectToQueryString,
  parseFetchResponse: parseFetchResponse,
  sleep: sleep
};
