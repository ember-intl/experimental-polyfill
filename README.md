# @ember-intl/polyfill

[![npm Version][npm-badge]][npm]
[![Build Status][travis-badge]][travis]

Automatically writes the [Intl.js polyfill](https://github.com/andyearnshaw/Intl.js/) to `assets/intl/` and optionally will insert script polyfill script tags into `index.html` at build time.

Using the polyfill is not required when targeting a modern set of browsers which natively implement the Intl API.

## Configure

* `ember g @ember-intl/polyfill`
* Edit `<project-root>/config/ember-intl.js`

## Options
* `locales` *Array*

Locales that your application supports i.e., `['en-us', 'fr-fr', 'en-ca']`

* `autoPolyfill` *?Object*
  * `locales` *?Array* optional, signals which locales to insert into head or vendor.  If not provided, will default `config.locales`
  * `complete` *Boolean* forces complete polyfill versus partial polyfill
  * `strategy` *Symbol* from `@ember-intl/polyfill/lib/strategies`
    * `SCRIPT_TAGS` includes necessary `script` tags into the head of index.html
    * `VENDOR` bundles polyfill within vendor.js

* `forcePolyfill` *Boolean*

Overrides `global.Intl.{NumberFormat,DateTimeFormat}` with `IntlPolyfill.{NumberFormat,DateTimeFormat}`
NOTE: if you are not vendoring the Intl polyfill, you must ensure the Intl polyfill is loaded before the `vendor.js` script tag.

* `disablePolyfill` *Boolean*

Disables the addon.

### Change asset output path

```js
/* <project-root>/ember-cli-build.js */
let app = new EmberApp({
  app: {
    intl: '/assets/intl' // default
  }
});

module.exports = app;
```

## Insert script tags

```js
/* <project-root>/config/ember-intl.js */

const { SCRIPT_TAGS } = require('@ember-intl/polyfill/lib/strategies');

module.exports = function(/* env */) {
  locales: ['en-us'],
  autoPolyfill: {
    /* adds Intl.min and en-us locale data script tags within index.html's head */
    strategy: SCRIPT_TAGS
  }
};
```

## Vendor/bundle Intl polyfill

### Vendor Partial Intl Polyfill

```js
/* <project-root>/config/ember-intl.js */

const { VENDOR } = require('@ember-intl/polyfill/lib/strategies');

module.exports = function(/* env */) {
  locales: ['en-us', 'fr-fr'],
  autoPolyfill: {
    /* vendors Intl polyfill without locale data */
    strategy: VENDOR,
    /* vendors only en-us.  If `autoPolyfill.locales` is not set, it will use `config.locales` (en-us, fr-fr) */
    locales: ['en-us']
  }
};
```

### Vendor Complete Polyfill

```js
/* <project-root>/config/ember-intl.js */

const { VENDOR } = require('@ember-intl/polyfill/lib/strategies');

module.exports = function(/* env */) {
  locales: ['en-us'],
  autoPolyfill: {
    strategy: VENDOR,
    /* vendors *complete* Intl polyfill */
    complete: true
  }
};
```

## Force polyfill

Since locale-data can vary between browser vendors & versions, you may want to override the `global.Intl` object with the polyfill to improve consistency.  This replaces the `global.Intl.{DateTimeFormat,NumberFormat}` constructors with `global.IntlPolyfill.{DateTimeFormat,NumberFormat}`.

```js
/* <project-root>/config/ember-intl.js */
module.exports = function(/* env */) {
  locales: ['en-us'],
  forcePolyfill: true
};
```

## Manually assign Intl polyfill & data

Add the following tags to your `index.html`, or any mechanism in which you serve
your your application payload.  Note: these script tags should be set above
the application's script tag.

```html
<script src="{{rootURL}}assets/intl/intl.min.js"></script>
<script src="{{rootURL}}assets/intl/locales/en-us.js"></script>
<script src="{{rootURL}}assets/intl/locales/fr-fr.js"></script>
<script src="{{rootURL}}assets/intl/locales/es-es.js"></script>
<!--
You can view the full list of CLDR locales which can be accessed from the `/assets/intl` folder
of your application.  The CLDRs are automatically placed there at build time.  Typically this folder
on within your project is ``<project-root>/dist/assets/intl`

Full list: https://github.com/yahoo/formatjs-extract-cldr-data/tree/master/data/main
-->
```

[npm]: https://www.npmjs.org/package/@ember-intl/polyfill
[npm-badge]: https://img.shields.io/npm/v/@ember-intl/polyfill.svg?style=flat-square
[travis]: https://travis-ci.org/ember-intl/polyfill
[travis-badge]: https://travis-ci.org/ember-intl/polyfill.svg?branch=master
