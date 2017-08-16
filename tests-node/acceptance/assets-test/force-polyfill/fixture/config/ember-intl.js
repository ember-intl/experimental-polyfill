/* eslint-env node */

module.exports = function(/* env */) {
  return {
    locales: ['en-us'],
    forcePolyfill: true,
    autoPolyfill: {
      vendor: true,
      complete: false
    }
  };
};
