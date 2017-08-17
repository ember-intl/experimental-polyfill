/* eslint-env node */
'use strict';

const mocha = require('mocha');
const { expect } = require('chai');
const request = require('denodeify')((require('request')));
const readPolyfill = require('../../../lib/read-polyfill');
const localeDataFor = require('../../../lib/locale-data-for');
const AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;
const debug = require('debug')('assets-test:autopolyfill:vendor-min-cherrypick-locales');

const { describe, before, after, it } = mocha;

describe('autopolyfill/vendor-min-cherrypick-locales acceptance', function() {
  this.timeout(400000);

  before(function() {
    let app = this.app = new AddonTestApp();

    return app
      .create('fixture', {
        fixturesPath: 'tests-node/acceptance/assets-test/autopolyfill/vendor-min-cherrypick-locales/'
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

  it('assets/vendor.js should contain min intl polyfill', function() {
    return request(`http://localhost:49741/assets/vendor.js`).then(res => {
      let polyfill = readPolyfill();
      let data = {
        en_us: localeDataFor('en-US'),
        fr_fr: localeDataFor('fr-FR'),
        en_ca: localeDataFor('en-CA')
      };

      expect(res.statusCode).to.equal(200);
      expect(res.body.includes(polyfill)).to.equal(true);
      expect(res.body.includes(data.fr_fr)).to.equal(true);
      expect(res.body.includes(data.en_ca)).to.equal(true);
      expect(res.body.includes(data.en_us)).to.equal(false);
    });
  });
});
