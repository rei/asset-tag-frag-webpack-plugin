[![Build Status](https://travis-ci.org/rei/asset-tag-frag-webpack-plugin.svg?branch=master)](https://travis-ci.org/rei/asset-tag-frag-webpack-plugin)

# asset-tag-frag-webpack-plugin

# Description

A Webpack plugin that generates HTML fragments for your build assets.

# Usage

## Basic Usage

```javascript
// webpack.conf.js
const AssetTagPlugin = require('asset-tag-frag-webpack-plugin');

module.exports = 
  {
    entry: {
      app: '/path/to/app'
    },
    output: {
      path: '/path/to/output',
      name: [name].bundle.js
    } 
  },
  ...
  {
    ..
    plugins: [
      new AssetTagPlugin()
    ]
  }
```

This will write your js and css asset tags to 2 files:

- \<output dir\>/assets.js.html
- \<output dir\>/assets.css.html

## Plugin Options

You may pass an options object to the plugin to customize the filenames you want to write tags to as well as tag attributes you want to include in the tag. 

NOTE: for now, all tag attributes you specify are included in corresponding js/css tags.
  
```javascript
  new AssetPlugin({
    js: {
      filename:    {String},  // name of assets fragment file
      prependPath: {String},  // path to prepend
      tagProps:    {Object},  // additional tag properties
      
    },
    css: {
      filename:    {String},
      prependPath: {String},
      tagProps:    {Object},
      
    }
  })
```

# Example

```javascript
new AssetTagPlugin({
  js: {
    filename: "js-assets.html",
    prependPath: "/static/",
    tagProps: {
      async: true
    },
  },
  css: {
    filename: "css-assets.html",
    prependPath: "/static/",
    tagProps: {
      id: "css-app-bundle"
    }
  }
})
```

This would generate 2 files in your output directory:

```html
<!-- js-assets.html -->
<script src="/static/app.bundle.js" async=true></script>
```

```html
<!--css-assets.html -->
<link href="/static/app.bundle.css" id="css-app-bundle">
``` 
# Assumptions

- This assumes you are using webpack ^3.0.0. It has not been tested with older versions.