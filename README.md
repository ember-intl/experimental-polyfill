# @ember-intl/polyfill

[![npm Version][npm-badge]][npm]
[![Build Status][travis-badge]][travis]

Automatically writes the [Intl.js polyfill](https://github.com/andyearnshaw/Intl.js/) to `assets/intl/` and optionally will insert script polyfill script tags into `index.html` at build time.

Using the polyfill is not required when targeting a modern set of browsers which natively implement the Intl API.

## Configure

* `ember g @ember-intl/polyfill`
* Edit `<project-root>/config/ember-intl.js`

## Options
* `autoPolyfill` (default: `false`)
  * automatically includes javascript `script` tags into the head of index.html
  * optionally supports vendoring/bundling the Intl Polyfill and certain Intl Polyfill locale-data within vendor.js

* `forcePolyfill` (default: `false`)
overrides `global.Intl.{NumberFormat,DateTimeFormat}` with `IntlPolyfill.{NumberFormat,DateTimeFormat}`
NOTE: if you are not vendoring the Intl polyfill, you must ensure the Intl polyfill is loaded before the `vendor.js` script tag.

* `disablePolyfill` (default: `false`)
disables addon

* `locales` (default: `[]`)
locales that your application supports i.e., `['en-us', 'fr-fr', 'en-ca']`

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

## Automatically inject script tags

```js
/* <project-root>/config/ember-intl.js */
module.exports = function(/* env */) {
  locales: ['en-us'],
  autoPolyfill: true /* adds Intl.min and en-us locale data script tags to index.html head */
};
```

## Vendor polyfill into vendor.js

```js
/* <project-root>/config/ember-intl.js */
module.exports = function(/* env */) {
  locales: ['en-us'],
  autoPolyfill: {
    vendor: true,
    complete: true /* vendors *complete* Intl polyfill */
  }
};
```

```js
/* <project-root>/config/ember-intl.js */
module.exports = function(/* env */) {
  locales: ['en-us'],
  autoPolyfill: {
    vendor: true, /* vendors Intl polyfill without locale data */
    locales: ['en-us'] /* vendors only en-us locale */
  }
};
```

## Force polyfill

Since locale-data can vary between browser vendors & versions, you may want to override the `Intl` object with the polyfill to improve consistency.

```js
/* <project-root>/config/ember-intl.js */
module.exports = function(/* env */) {
  locales: ['en-us'],
  forcePolyfill: true, /* adds Intl.min and en-us locale data script tags to index.html head */
  autoPolyfill: {
    vendor: true
  }
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
