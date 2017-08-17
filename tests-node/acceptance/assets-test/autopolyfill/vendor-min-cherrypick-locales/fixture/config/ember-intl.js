/* eslint-env node */

const { VENDOR } = require('@ember-intl/polyfill/lib/strategies');

module.exports = function(/* env */) {
  return {
    locales: ['en-us', 'en-ca', 'fr-fr'],
    autoPolyfill: {
      strategy: VENDOR,
      locales: ['fr-fr', 'en_CA'] /* vendor only fr-fr, all-else written to /assets */
    }
  };
};
