'use strict';

const helper = require('./signalfx-helper');

let coldStart = true;

module.exports = class WrapperCore {
  constructor(
    source,
    dimensions,
    accessToken,
    originalObj,
    originalFn
  ) {
    this.originalObj = originalObj;
    this.originalFn = originalFn;

    helper.setAccessToken(accessToken);
    helper.setDefaultDimensions(Object.assign(this.defaultDimensions(), {metric_source: `${source}_wrapper`}, dimensions));
    if (coldStart) {
      this.wasCold = true;
      coldStart = false;
    }
    return this;
  }
}