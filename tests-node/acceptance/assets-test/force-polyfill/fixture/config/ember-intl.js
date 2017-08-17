/* eslint-env node */

const { VENDOR } = require('@ember-intl/polyfill/lib/strategies');

module.exports = function(/* env */) {
  return {
    locales: ['en-us'],
    forcePolyfill: true,
    autoPolyfill: {
      strategy: VENDOR,
      complete: false
    }
  };
};
