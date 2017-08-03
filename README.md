# @ember-intl/polyfill

Automatically writes the [Intl.js polyfill][] to `<dist>/assets/intl/`.

Using the polyfill is not required when targeting a modern set of browsers which natively implement the Intl API.

## Automatically inject script tags

```js
// config/ember-intl.js
module.exports = function(/* environment */) {
  autoPolyfill: true
};
```

## Manually register Intl polyfill & data

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
on your filesystem is ``<project>/dist/assets/intl`

Full list: https://github.com/yahoo/formatjs-extract-cldr-data/tree/master/data/main
-->
```
