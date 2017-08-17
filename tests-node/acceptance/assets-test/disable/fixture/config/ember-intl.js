/* eslint-env node */

const { VENDOR } = require('@ember-intl/polyfill/lib/strategies');

module.exports = function(/* env */) {
  return {
    disablePolyfill: true,
    locales: ['en-us', 'fr-fr'],
    autoPolyfill: {
      strategy: VENDOR,
      locales: ['en-us']
    }
  };
};
