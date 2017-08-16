'use strict';

const fs = require('fs');
const path = require('path');

module.exports = function(locale) {
  return fs.readFileSync(
    path.join(
      path.dirname(require.resolve('intl')
    ), 'locale-data', 'jsonp', `${locale}.js`),
    'utf8'
  );
}
