/* eslint-env node */
'use strict';

const path = require('path');
const get = require('lodash.get');
const funnel = require('broccoli-funnel');
const existsSync = require('exists-sync');
const mergeTrees = require('broccoli-merge-trees');
const lowercaseTree = require('./lib/lowercase-tree');
const debug = require('debug')('@ember-intl/polyfill');
const strategies = require('./lib/strategies');
const UnwatchedDir = require('broccoli-source').UnwatchedDir;

const isArray = Array.isArray;
const assign = Object.assign;
const VENDOR = strategies.VENDOR;
const SCRIPT_TAGS = strategies.SCRIPT_TAGS;

module.exports = {
  name: '@ember-intl/polyfill',
  intlPlugin: true,
  addonConfig: null,

  included() {
    this._super.included.apply(this, arguments);

    let host = (this.app = this._findHost());
    this.addonConfig = assign({}, this.getConfig(host.env), this.addonConfig);
    this._nodeModulePath = this.intlRelativeToProject(this.project.root);
    this.importPolyfill(this.app);
  },

  /* NOTE: initializePlugin will get called before `included` when consumed as a plugin */
  initializePlugin(parentOptions) {
    this.addonConfig = assign({}, this.addonConfig, parentOptions);
  },

  getConfig(env) {
    let configPath = path.join(this.project.configPath(), '..', 'ember-intl.js');
    let config = {};

    if (existsSync(configPath)) {
      config = assign({}, require(configPath)(env));

      if (isArray(config.locales)) {
        config.locales = config.locales.map(this.normalizeLocale, this);
      }

      if (isArray(get(config, 'autoPolyfill.locales'))) {
        config.autoPolyfill.locales = config.autoPolyfill.locales.map(this.normalizeLocale, this);
      }
    }

    let optionalAssetPath = get(this, 'app.options.app.intl');
    if (optionalAssetPath) {
      config.assetPath = optionalAssetPath;
    }

    return assign({
      autoPolyfill: false,
      disablePolyfill: false,
      assetPath: 'assets/intl',
      locales: [],
    }, config);
  },

  normalizeLocale(localeName) {
    return localeName.toLowerCase().replace(/\_/g, '-');
  },

  contentFor(name, config) {
    let addonConfig = this.addonConfig;
    if (name === 'head' && !addonConfig.disablePolyfill) {
      let autoPolyfill = addonConfig.autoPolyfill;

      if (autoPolyfill === true || (typeof autoPolyfill === 'object' && get(autoPolyfill, 'strategy') === SCRIPT_TAGS)) {
        let prefix = '';

        if (config.rootURL) {
          prefix += config.rootURL;
        }

        if (addonConfig.assetPath) {
          prefix += addonConfig.assetPath;
        }

        if (autoPolyfill.complete) {
          return `<script src="${prefix}/intl.complete.js"></script>`;
        }

        let locales = get(autoPolyfill, 'locales') || get(addonConfig, 'locales') || [];
        if (locales.length > 0) {
          debug(`inserting ${locales.join(',')}`);
          let scripts = locales.map(locale => `<script src="${prefix}/locales/${locale}.js"></script>`);

          return [`<script src="${prefix}/intl.min.js"></script>`].concat(scripts).join('\n');
        }
      }
    }
  },

  intlRelativeToProject(basedir) {
    try {
      /* project with intl as a dependency takes priority */
      let resolve = require('resolve');

      return path.dirname(resolve.sync('intl', { basedir: basedir }));
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
    let addonConfig = this.addonConfig;

    if (addonConfig.disablePolyfill) {
      return;
    }

    if (get(addonConfig, 'autoPolyfill.strategy') === VENDOR) {
      let locales = get(addonConfig, 'autoPolyfill.locales');
      if (!locales || (locales && locales.length === 0)) {
        locales = get(addonConfig, 'locales') || [];
      }

      if (get(addonConfig, 'autoPolyfill.complete')) {
        this.appImport(app, 'vendor/intl/intl.complete.js');
      }
      else if (typeof get(addonConfig, 'autoPolyfill.complete') === 'undefined' && locales.length === 0) {
        this.ui.writeLine('@ember-intl/polyfill: no locales were provided or discovered. Defaulting to the complete locale dataset for Intl polyfill.');
        this.ui.writeLine('To silence this error, either set `autoPolyfill.complete = true` or specify `locales` within config/ember-intl.config');
        this.appImport(app, 'vendor/intl/intl.complete.js');
      }
      else {
        this.appImport(app, 'vendor/intl/intl.min.js');
        locales.forEach(locale => this.appImport(app, `vendor/intl/locales/${locale}.js`));
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

  createPolyfillTree() {
    let addonConfig = this.addonConfig;
    let locales = this.addonConfig.locales || [];
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

    /* if empty, all locales are included within the tree */
    if (locales.length > 0) {
      localeFunnel.include = addonConfig.locales.map(locale => new RegExp(`^${locale}.js$`, 'i'));
    }

    let localesTree = funnel(tree, localeFunnel);
    trees.push(lowercaseTree(mergeTrees([polyfillTree, localesTree])));

    return mergeTrees(trees);
  },

  treeForVendor(tree) {
    if (this.addonConfig.disablePolyfill) {
      return;
    }

    let trees = [];

    if (tree && this.addonConfig.forcePolyfill) {
      trees.push(tree);
    }

    trees.push(funnel(this.createPolyfillTree(), {
      destDir: 'intl'
    }));

    return mergeTrees(trees);
  },

  treeForPublic() {
    if (this.addonConfig.disablePolyfill) {
      return;
    }

    let tree = this.createPolyfillTree();

    return funnel(tree, {
      destDir: this.addonConfig.assetPath
    });
  }
};
