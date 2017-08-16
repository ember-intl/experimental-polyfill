/* eslint-env node */
'use strict';

const mocha = require('mocha');
const { expect } = require('chai');
const request = require('denodeify')((require('request')));
const readPolyfill = require('../../../lib/read-polyfill');
const AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;
const debug = require('debug')('assets-test:autopolyfill:vendor-complete');

const { describe, before, after, it } = mocha;

describe('autopolyfill/vendor-complete acceptance', function() {
  this.timeout(400000);

  before(function() {
    let app = this.app = new AddonTestApp();

    return app
      .create('fixture', {
        fixturesPath: 'tests-node/acceptance/assets-test/autopolyfill/vendor-complete/'
      })
      .then(() => debug('asset path %s', app.path))
      .then(() => app.startServer());
  });

  after(function() {
    return this.app.stopServer();
  });

  it('index.html', function() {
    return request({
      url: 'http://localhost:49741',
      headers: {
        Accept: 'text/html'
      }
    }).then(res => {
      expect(res.statusCode).to.equal(200);
      expect(res.headers['content-type']).to.eq('text/html; charset=UTF-8');
      expect(res.body).to.contain('<body>');
      expect(res.body).to.not.contain('<script src="/assets/intl/');
    });
  });

  it('assets/vendor.js should contain complete intl polyfill', function() {
    return request(`http://localhost:49741/assets/vendor.js`).then(res => {
      let polyfillContent = readPolyfill('complete');
      expect(res.statusCode).to.equal(200);
      expect(res.body.includes(polyfillContent)).to.equal(true);
    });
  });
});
