'use strict';

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
  objectToQueryString: objectToQueryString,
  parseFetchResponse: parseFetchResponse
};
