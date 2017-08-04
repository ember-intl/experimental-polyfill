/* eslint-env node */
'use strict';

const path = require('path');
const get = require('lodash.get');
const funnel = require('broccoli-funnel');
const mergeTrees = require('broccoli-merge-trees');
const renameTree = require('broccoli-stew').rename;
const UnwatchedDir = require('broccoli-source').UnwatchedDir;

function lowercaseTree(tree) {
  return renameTree(tree, function(filepath) {
    return filepath.toLocaleLowerCase();
  });
}

module.exports = {
  'ember-intl-ext': true,

  name: '@ember-intl/polyfill',
  assetPath: 'assets/intl',
  locales: [],
  enabled: true,
  insertScripts: false,

  _isHost: false,

  included(app) {
    this._super.included.apply(this, arguments);

    let optionalAssetPath = get(this, 'app.options.app.intl');
    let host = (this.app = this._findHost());
    this._isHost = app === host;

    if (optionalAssetPath) {
      this.assetPath = optionalAssetPath;
    }

    /* TODO: allow to work outside of ember-intl by reading config options from app options? */
  },

  onRegisterPlugin(initialState = {}) {
    if (initialState.locales) {
      this.locales = initialState.locales;
    }

    Object.assign(this, initialState.polyfill);
  },

  contentFor(name, config) {
    if (name === 'head' && this.enabled && this.insertScripts) {
      let locales = this.locales;
      let prefix = '';

      if (config.rootURL) {
        prefix += config.rootURL;
      }
      if (this.assetPath) {
        prefix += this.assetPath;
      }

      let scripts = locales.map(locale => `<script src="${prefix}/locales/${locale}.js"></script>`);

      return [`<script src="${prefix}/intl.min.js"></script>`].concat(scripts).join('\n');
    }
  },

  treeForPublic() {
    let intlPath;

    try {
      /* TODO: resolve relative to the project directory first */
      intlPath = require.resolve('intl')
    } catch(e) {
      if (e.code === 'MODULE_NOT_FOUND') {
        this.ui.writeLine(`@ember-intl/polyfill: intl polyfill could not be found.  Try "npm install" to ensure your dependencies are fully installed.`)
        return;
      }

      throw e;
    }

    let tree = new UnwatchedDir(path.dirname(intlPath));
    let trees = [];

    trees.push(
      funnel(tree, {
        srcDir: 'dist',
        files: ['Intl.js.map'],
        destDir: this.assetPath
      })
    );

    let polyfillTree = funnel(tree, {
      srcDir: 'dist',
      files: ['Intl.complete.js', 'Intl.js', 'Intl.js.map', 'Intl.min.js', 'Intl.min.js.map'],
      destDir: this.assetPath
    });

    let localeFunnel = {
      srcDir: 'locale-data/jsonp',
      destDir: `${this.assetPath}/locales`
    };

    if (this.locales && this.locales.length) {
      localeFunnel.include = this.locales.map(locale => new RegExp(`^${locale}.js$`, 'i'));
    }

    let localesTree = funnel(tree, localeFunnel);
    trees.push(lowercaseTree(mergeTrees([polyfillTree, localesTree])));

    return mergeTrees(trees, { overwrite: true });
  }
};
