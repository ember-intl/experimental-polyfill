/* eslint-env node */
'use strict';

const mocha = require('mocha');
const { expect } = require('chai');
const denodeify = require('denodeify');
const request = denodeify(require('request'));
const debug = require('debug')('assets-test:autopolyfill-disable');
const AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;

const { describe, before, after, it } = mocha;

describe('autopolyfill-disable acceptance', function() {
  this.timeout(300000);

  before(function() {
    let app = this.app = new AddonTestApp();

    return app
      .create('autopolyfill-disable', {
        fixturesPath: 'tests-node/fixtures'
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

  it('assets/intl/intl.min.js should 200', function() {
    return request(`http://localhost:49741/assets/intl/intl.min.js`).then(res => {
      expect(res.statusCode).to.equal(200);
      expect(res.headers['content-type']).to.eq('application/javascript; charset=UTF-8');
    });
  });

  it('assets/intl/{en-us,fr-fr}.js  should 200', function() {
    return Promise.all(['en-us', 'fr-fr'].map(locale => {
      return request(`http://localhost:49741/assets/intl/locales/${locale}.js`).then(res => {
        expect(res.statusCode).to.equal(200);
        expect(res.headers['content-type']).to.eq('application/javascript; charset=UTF-8');
      });
    }));
  });
});
