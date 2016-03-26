'use strict';
let conf = require('../nobreaks.conf.json');

function buildGetUrl(path, params) {
  return conf.battlenet.host + path + '?' + objectToQueryString(Object.assign({}, params || {}, {apikey: conf.battlenet.key}));
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

module.exports = {
  buildGetUrl: buildGetUrl,
  objectToQueryString: objectToQueryString,
  parseFetchResponse: parseFetchResponse
};
