/* eslint-env node */

const { /* VENDOR, */ SCRIPT_TAGS } = require('@ember-intl/polyfill/lib/strategies');

module.exports = function(/* env */) {
  return {
    /**
    * Collection of locales that the application supportss
    *
    * @property locales
    * @type {Array}
    */
    locales: ['en-us'],

    /**
    * Force global.IntlPolyfill to overwrites global.Intl
    *
    * @property forcePolyfill
    * @type {Boolean}
    */
    forcePolyfill: false,

    /**
    * disablePolyfill prevents the polyfill from being bundled in the asset folder of the build
    *
    * @property disablePolyfill
    * @type {Boolean}
    */
    disablePolyfill: false,

    /**
    * Configure a strategy for loading the polyfill into your application
    *
    * @property autoPolyfill
    * @type {Object}
    */
    autoPolyfill: {
      /**
      * Supported strategies:
      * SCRIPT_TAGS -> inserts script tags into index.html
      * VENDOR -> bundles polyfill into vendor.js
      */
      strategy: SCRIPT_TAGS,

      /* Bundles the complete polyfill instead of the default partial polyfill */
      complete: false,

      /**
       * If provided, will use this collection of locales within the strategy.
       * Useful if you want to vendor/insert script tags for a subset of the locales
       * defined in `config.locales` above.
       *
       * @property locales
       * @type {?Array}
       */
      locales: null
    }
  };
};
