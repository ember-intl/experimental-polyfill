/* eslint-env node */

const { VENDOR } = require('@ember-intl/polyfill/lib/strategies');

module.exports = function(/* env */) {
  return {
    autoPolyfill: {
      strategy: VENDOR
    }
  };
};
