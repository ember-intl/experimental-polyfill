/* eslint-env node */

module.exports = function(/* env */) {
  return {
    locales: ['en-us', 'en-ca', 'fr-fr'],
    /**
    * autoPolyfill, when true will automatically inject the IntlJS polyfill
    * into index.html
    *
    * @property autoPolyfill
    * @type {Boolean}
    * @default "false"
    */
    autoPolyfill: {
      vendor: true,
      locales: ['fr-fr', 'en_CA'] /* vendor only fr-fr, all-else written to /assets */
    }
  };
};
