'use strict';

const signalfx = require('signalfx');

const AUTH_TOKEN = process.env.SIGNALFX_AUTH_TOKEN;
const TIMEOUT_MS = process.env.SIGNALFX_SEND_TIMEOUT;

const INGEST_ENDPOINT = process.env.SIGNALFX_INGEST_ENDPOINT;

var CLIENT_OPTIONS = {};
if (INGEST_ENDPOINT) {
  CLIENT_OPTIONS.ingestEndpoint = INGEST_ENDPOINT
} else {
  CLIENT_OPTIONS.ingestEndpoint = 'https://pops.signalfx.com'
}

const timeoutMs = Number(TIMEOUT_MS);
if (!isNaN(timeoutMs)) {
  CLIENT_OPTIONS.timeout = timeoutMs;
} else {
  CLIENT_OPTIONS.timeout = 300;
}

CLIENT_OPTIONS.batchSize = 1000;

var defaultDimensions = {};
var metricSender;

var sendPromises = [];

var dpBuffers = {};

function sendMetric(metricName, metricType, metricValue, dimensions={}) {
  var dp = {
    metric: metricName,
    value: metricValue,
    dimensions: Object.assign({}, dimensions, defaultDimensions)
  };
  var datapoints = {};
  datapoints[metricType] = [dp];

  // if(!dpBuffers[metricType]) {
  //   dpBuffers[metricType] = [];
  // }

  // dpBuffers[metricType].push(dp);

  // var sendPromise = new Promise((resolve) => {
  //   setTimeout(() => {
  //     for(var mt in dpBuffers) {
  //       console.log("Flushing " + mt + " metrics.");
        
  //       for(var dp of dpBuffers[mt]) {
  //         console.log(dp);
  //       }

  //       delete dpBuffers[mt];
  //     }
  //     console.log("Buffer cleared. Resolving it.");
  //     resolve();
  //   }, 3000);
  // })

  var sendPromise = metricSender.send(datapoints).catch((err) => {
    if (err) {
      console.log(err);
    }
  });
  sendPromises.push(sendPromise);
  return sendPromise;
}

const clearSendPromises = () => {
  sendPromises = [];
}

function setAccessToken(accessToken) {
  metricSender = new signalfx.IngestJson(accessToken || AUTH_TOKEN, CLIENT_OPTIONS);
} 

module.exports = {
  setAccessToken: setAccessToken,

  setDefaultDimensions: function(dimensions) {
    defaultDimensions = Object.assign(defaultDimensions, dimensions);
  },

  sendGauge: function addGauge(metricName, metricValue, dimensions) {
    return sendMetric(metricName, 'gauges', metricValue, dimensions);
  },

  sendCounter: function addCounter(metricName, metricValue, dimensions) {
    return sendMetric(metricName, 'counters', metricValue, dimensions);
  },

  waitForAllSends: function waitForAllSends() {
    return Promise.all(sendPromises).then(clearSendPromises, clearSendPromises);
  }
}
