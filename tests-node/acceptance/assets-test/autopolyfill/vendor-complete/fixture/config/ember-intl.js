/* eslint-env node */

const { VENDOR } = require('@ember-intl/polyfill/lib/strategies');

module.exports = function(/* env */) {
  return {
    locales: ['en-us', 'fr-fr'],
    autoPolyfill: {
      complete: true,
      strategy: VENDOR
    }
  };
};
