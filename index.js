/* eslint-env node */
'use strict';

const path = require('path');
const get = require('lodash.get');
const funnel = require('broccoli-funnel');
const existsSync = require('exists-sync');
const mergeTrees = require('broccoli-merge-trees');
const renameTree = require('broccoli-stew').rename;
const UnwatchedDir = require('broccoli-source').UnwatchedDir;

function lowercaseTree(tree) {
  return renameTree(tree, function(filepath) {
    return filepath.toLocaleLowerCase();
  });
}

module.exports = {
  name: '@ember-intl/polyfill',
  intlPlugin: true,
  _isHost: false,

  included(app) {
    this._super.included.apply(this, arguments);
    let host = (this.app = this._findHost());
    this._isHost = app === host;
    this._addonConfig = this.getConfig(host.env);
  },

  onRegisterPlugin(parentOptions = {}) {
    Object.assign(this._addonConfig, parentOptions);
  },

  getConfig(env) {
    let configPath = path.join(this.project.configPath(), '..', 'ember-intl.js');
    let config = {};

    if (existsSync(configPath)) {
      config = require(configPath)(env);

      if (Array.isArray(config.locales)) {
        config.locales = config.locales
          .filter(locale => typeof locale === 'string')
          .map(locale => locale.toLowerCase().replace(/\_/g, '-'));
      }
    }

    let optionalAssetPath = get(this, 'app.options.app.intl');
    if (optionalAssetPath) {
      config.assetPath = optionalAssetPath;
    }

    return Object.assign({
      publicOnly: false,
      disablePolyfill: false,
      assetPath: 'assets/intl',
      locales: []
    }, config);
  },

  contentFor(name, config) {
    let addonConfig = this._addonConfig;

    if (name === 'head' && !addonConfig.disablePolyfill && addonConfig.autoPolyfill) {
      let prefix = '';

      if (config.rootURL) {
        prefix += config.rootURL;
      }

      if (addonConfig.assetPath) {
        prefix += addonConfig.assetPath;
      }

      if (get(this, '_addonConfig.locales.length') > 0) {
        let scripts = addonConfig.locales.map(locale => `<script src="${prefix}/locales/${locale}.js"></script>`);

        return [`<script src="${prefix}/intl.min.js"></script>`].concat(scripts).join('\n');
      }

      return `<script src="${prefix}/intl.complete.js"></script>`;
    }
  },

  treeForPublic() {
    let addonConfig = this._addonConfig;

    if (addonConfig.disablePolyfill) {
      return;
    }

    let nodeModulePath;

    try {
      /* project with intl as a dependency takes priority */
      let resolve = require('resolve');
      nodeModulePath = resolve.sync('intl', { basedir: this.app.project.root });
    } catch(_) {
      try {
        nodeModulePath = require.resolve('intl')
      } catch(e) {
        if (e.code === 'MODULE_NOT_FOUND') {
          this.ui.writeLine(`@ember-intl/polyfill: intl polyfill could not be found.  Try "npm install" to ensure your dependencies are fully installed.`)
          return;
        }

        throw e;
      }
    }

    let tree = new UnwatchedDir(path.dirname(nodeModulePath));
    let trees = [];

    trees.push(
      funnel(tree, {
        srcDir: 'dist',
        include: ['*.map'],
        destDir: addonConfig.assetPath
      })
    );

    let polyfillTree = funnel(tree, {
      srcDir: 'dist',
      include: ['*.js'],
      destDir: addonConfig.assetPath
    });

    let localeFunnel = {
      srcDir: 'locale-data/jsonp',
      destDir: `${addonConfig.assetPath}/locales`
    };

    if (get(this, '_addonConfig.locales.length') > 0) {
      localeFunnel.include = addonConfig.locales.map(locale => new RegExp(`^${locale}.js$`, 'i'));
    }

    let localesTree = funnel(tree, localeFunnel);
    trees.push(lowercaseTree(mergeTrees([polyfillTree, localesTree])));

    return mergeTrees(trees, { overwrite: true });
  }
};
