/* eslint-env node */
'use strict';

const mocha = require('mocha');
const { expect } = require('chai');
const debug = require('debug')('assets-test:disable');
const request = require('denodeify')((require('request')));
const AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;

const { describe, before, after, it } = mocha;

describe('disable acceptance', function() {
  this.timeout(400000);

  before(function() {
    let app = this.app = new AddonTestApp();

    return app
      .create('fixture', {
        fixturesPath: 'tests-node/acceptance/assets-test/disable'
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
      expect(res.body).to.not.contain('<script src="/assets/intl/intl.min.js"></script>');
      expect(res.body).to.not.contain('<script src="/assets/intl/locales/en-us.js"></script>');
    });
  });

  it('assets/intl/intl.min.js should 404', function() {
    return request(`http://localhost:49741/assets/intl/intl.min.js`).then(res => {
      expect(res.statusCode).to.equal(404);
    });
  });

  it('assets/intl/{en-us,fr-fr}.js should 404', function() {
    return Promise.all(['en-us', 'fr-fr'].map(locale => {
      return request(`http://localhost:49741/assets/intl/locales/${locale}.js`).then(res => {
        expect(res.statusCode).to.equal(404);
      });
    }));
  });

  it('assets/vendor.js should not contain intl polyfill', function() {
    return request(`http://localhost:49741/assets/vendor.js`).then(res => {
      expect(res.statusCode).to.equal(200);
      expect(res.body.includes('IntlPolyfill')).to.equal(false);
    });
  });
});
