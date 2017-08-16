/* eslint-env node */
'use strict';

const stew = require('broccoli-stew');

const rename = stew.rename;

module.exports = function lowercaseTree(tree) {
  return rename(tree, function(filepath) {
    return filepath.toLowerCase();
  });
};
