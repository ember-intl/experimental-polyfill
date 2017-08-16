'use strict';

const fs = require('fs');
const path = require('path');

module.exports = function(type = 'min') {
  return fs.readFileSync(
    path.join(
      path.dirname(require.resolve('intl')
    ), 'dist', `Intl.${type}.js`),
    'utf8'
  ).replace(`//# sourceMappingURL=Intl.${type}.js.map`, ''); /* ember-cli lobs off the sourceMappingURL */
}
