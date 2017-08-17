/* eslint-env node */

const { SCRIPT_TAGS } = require('@ember-intl/polyfill/lib/strategies');

module.exports = function(/* env */) {
  return {
    locales: ['en-us', 'fr-fr'],
    autoPolyfill: {
      strategy: SCRIPT_TAGS,
      complete: true,
      locales: null
    }
  };
};
