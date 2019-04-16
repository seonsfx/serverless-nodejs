'use strict'

module.exports = class ResponseWrapper {
  constructor(originalResp, onClose) {
    this.finishProcessed = false;
    this.originalResp = originalResp;

    const wrappedResp = Object.assign({}, originalResp);

    for (let method of methods) {
      wrappedResp[method.name] = (...args) => {
        const r = this.originalResp[method.name].apply(this.originalResp, args);
        // Call it closed when response action is finished
        // Expressjs Response class internally inherit http.ServerResponse of Nodejs
        // https://nodejs.org/api/http.html#http_request_finished
        if (!this.finishProcessed && originalResp.finished) {
          this.finishProcessed = true;
          if (typeof onClose === 'function') {
            onClose();
          }
        }
        if (method.chained) {
          return wrappedResp;
        }
        return r;
      }
    }

    return wrappedResp;
  }
};

// Express.js 4 Methods to wrap.
const methods = [
  {
    name: 'append',
    chained: true
  },
  {
    name: 'attachment',
    chained: true
  },
  {
    name: 'cookie',
    chained: true
  },
  {
    name: 'clearCookie',
    chained: true
  },
  {
    name: 'format',
    chained: true
  },
  {
    name: 'links',
    chained: true
  },
  {
    name: 'location',
    chained: true
  },
  {
    name: 'set',
    chained: true
  },
  {
    name: 'status',
    chained: true
  },
  {
    name: 'type',
    chained: true
  },
  {
    name: 'vary',
    chained: true
  },
  {
    name: 'download'
  },
  {
    name: 'end'
  },
  {
    name: 'json'
  },
  {
    name: 'jsonp'
  },
  {
    name: 'redirect'
  },
  {
    name: 'render'
  },
  {
    name: 'send'
  },
  {
    name: 'sendFile'
  },
  {
    name: 'sendStatus'
  },
  {
    name: 'get'
  }
];