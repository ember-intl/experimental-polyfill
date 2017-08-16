/* eslint-env node */

module.exports = function(/* env */) {
  return {
    /**
    * autoPolyfill, when true will automatically inject the IntlJS polyfill
    * into index.html
    *
    * @property autoPolyfill
    * @type {Boolean}
    * @default "false"
    */
    autoPolyfill: {
      vendor: true
    }
  };
};
