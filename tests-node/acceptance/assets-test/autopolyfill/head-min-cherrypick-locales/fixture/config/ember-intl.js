/* eslint-env node */

const { /* VENDOR, */ SCRIPT_TAGS } = require('@ember-intl/polyfill/lib/strategies');

module.exports = function(/* env */) {
  return {
    locales: ['en-us', 'fr-fr'],
    autoPolyfill: {
      strategy: SCRIPT_TAGS,
      locales: ['fr-fr']
    }
  };
};
