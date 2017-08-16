/* eslint-env node */
'use strict';

const path = require('path');
const get = require('lodash.get');
const funnel = require('broccoli-funnel');
const existsSync = require('exists-sync');
const mergeTrees = require('broccoli-merge-trees');
const lowercaseTree = require('./lib/lowercase-tree');
const debug = require('debug')('@ember-intl/polyfill');
const UnwatchedDir = require('broccoli-source').UnwatchedDir;

module.exports = {
  name: '@ember-intl/polyfill',
  intlPlugin: true,
  _isHost: false,

  included(app) {
    this._super.included.apply(this, arguments);
    let host = (this.app = this._findHost());
    this._isHost = app === host;
    this._addonConfig = this.getConfig(host.env);
    this._nodeModulePath = this.intlRelativeToProject(this.app.project.root);
    this.importPolyfill(this.app);
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
      disablePolyfill: false,
      assetPath: 'assets/intl',
      locales: []
    }, config);
  },

  contentFor(name, config) {
    let addonConfig = this._addonConfig;
    let autoPolyfill = addonConfig.autoPolyfill;

    if (name === 'head' && !addonConfig.disablePolyfill) {
      if (autoPolyfill === true || (typeof autoPolyfill === 'object' && !get(autoPolyfill, 'vendor'))) {
        let locales = get(autoPolyfill, 'locales') || get(addonConfig, 'locales');
        let prefix = '';

        if (config.rootURL) {
          prefix += config.rootURL;
        }

        if (addonConfig.assetPath) {
          prefix += addonConfig.assetPath;
        }

        if ((locales && locales.length) && !get(autoPolyfill, 'complete')) {
          debug(`inserting ${locales.join(',')}`);
          let scripts = addonConfig.locales.map(locale => `<script src="${prefix}/locales/${locale}.js"></script>`);

          return [`<script src="${prefix}/intl.min.js"></script>`].concat(scripts).join('\n');
        } else {
          return `<script src="${prefix}/intl.complete.js"></script>`;
        }
      }
    }
  },

  intlRelativeToProject(project) {
    try {
      /* project with intl as a dependency takes priority */
      let resolve = require('resolve');

      return path.dirname(resolve.sync('intl', { basedir: project }));
    } catch(_) {
      try {
        return path.dirname(require.resolve('intl'));
      } catch(e) {
        if (e.code === 'MODULE_NOT_FOUND') {
          this.ui.writeLine(`@ember-intl/polyfill: intl polyfill could not be found.  Try "npm install" to ensure your dependencies are fully installed.`)
          return;
        }

        throw e;
      }
    }
  },

  importPolyfill(app) {
    let addonConfig = this._addonConfig;

    if (addonConfig.disablePolyfill) {
      return;
    }

    let locales = get(addonConfig, 'autoPolyfill.locales');

    if (get(addonConfig, 'autoPolyfill.vendor')) {
      /* TODO: maybe import complete if `locales` is not set and throw a warning to explicitly set `complete: true` to silence? */
      if (get(addonConfig, 'autoPolyfill.complete')) {
        this.appImport(app, 'vendor/intl/intl.complete.js');

        if (locales && locales.length) {
          this.ui.writeLine('@ember-intl/polyfill: when autoPolyfill.complete = true specificying individual locales is unncessary as all Intl locales are bundled.')
          this.ui.writeLine('To silence this error, remove `autoPolyfill.locales` or remove `autoPolyfill.complete`.');
        }
      }
      else {
        this.appImport(app, 'vendor/intl/intl.min.js');

        if (!locales || (!locales && locales.length)) {
          locales = get(addonConfig, 'locales');
        }

        if (locales && locales.length) {
          locales.forEach(locale => this.appImport(app, `vendor/intl/locales/${locale}.js`));
        }
      }
    }

    if (addonConfig.forcePolyfill) {
      this.appImport(app, 'vendor/intl/force-polyfill.js');
    }
  },

  appImport(app, filename, options) {
    debug(`importing: "${filename}"`);
    app.import(filename, options);
  },

  createAddonTree() {
    let addonConfig = this._addonConfig;
    let tree = new UnwatchedDir(this._nodeModulePath);
    let trees = [];

    trees.push(
      funnel(tree, {
        srcDir: 'dist',
        include: ['*.map']
      })
    );

    let polyfillTree = funnel(tree, {
      srcDir: 'dist',
      include: ['*.js']
    });

    let localeFunnel = {
      srcDir: 'locale-data/jsonp',
      destDir: `/locales`
    };

    if (get(this, '_addonConfig.locales.length') > 0) {
      localeFunnel.include = addonConfig.locales.map(locale => new RegExp(`^${locale}.js$`, 'i'));
    }

    let localesTree = funnel(tree, localeFunnel);
    trees.push(lowercaseTree(mergeTrees([polyfillTree, localesTree])));

    return mergeTrees(trees);
  },

  treeForVendor(tree) {
    let addonConfig = this._addonConfig;

    if (addonConfig.disablePolyfill) {
      return;
    }

    let trees = [];

    if (tree && addonConfig.forcePolyfill) {
      trees.push(tree);
    }

    trees.push(funnel(this.createAddonTree(), {
      destDir: 'intl'
    }));

    return mergeTrees(trees, { overwrite: true });
  },

  treeForPublic() {
    let addonConfig = this._addonConfig;

    if (addonConfig.disablePolyfill) {
      return;
    }

    let tree = this.createAddonTree();

    return funnel(tree, {
      destDir: addonConfig.assetPath
    });
  }
};
