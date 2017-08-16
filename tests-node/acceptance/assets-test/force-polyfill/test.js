/* eslint-env node */
'use strict';

const mocha = require('mocha');
const { expect } = require('chai');
const request = require('denodeify')((require('request')));
const debug = require('debug')('assets-test:force-polyfill');
const AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;

const { describe, before, after, it } = mocha;

describe('force-polyfill acceptance', function() {
  this.timeout(400000);

  before(function() {
    let app = this.app = new AddonTestApp();

    return app
      .create('fixture', {
        fixturesPath: 'tests-node/acceptance/assets-test/force-polyfill/'
      })
      .then(() => debug('asset path %s', app.path))
      .then(() => app.startServer());
  });

  after(function() {
    return this.app.stopServer();
  });

  it('assets/vendor.js should contain min intl polyfill', function() {
    return request(`http://localhost:49741/assets/vendor.js`).then(res => {
      expect(res.body.includes('global.Intl.NumberFormat = global.IntlPolyfill.NumberFormat')).to.equal(true);
      expect(res.body.includes('global.Intl.DateTimeFormat = global.IntlPolyfill.DateTimeFormat')).to.equal(true);
    });
  });
});
