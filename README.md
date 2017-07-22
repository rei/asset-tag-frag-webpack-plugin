# asset-tag-frag-webpack-plugin

# Description

A Webpack plugin that generates HTML fragments for your build assets.

# Usage

## Basic Usage
    // webpack.conf.js
    const AssetTagPlugin = require('asset-tag-frag-webpack-plugin');
    
    ...
    {
      ..
      plugins: [
        new AssetTagPlugin()
      ]
    }

This will write your js and css asset tags to 2 files:

- \<output dir\>/assets.js.html
- \<output dir\>/assets.css.html

## Plugin Options

You may pass an options object to the plugin to customize the filenames you want to write tags to as well as tag attributes you want to include in the tag. 

NOTE: for now, all tag attributes you specify are included in corresponding js/css tags.
  
    {
      js: {
        filename: {String},
        tagProps: {Object},
      },
      css: {
        filename: {String},
        tagProps: {Object}
      }
    }

# Example

    new AssetTagPlugin({
      js: {
        filename: "js-assets.html",
        tagProps: {
          async: true
        },
      },
      css: {
        filename: "css-assets.html",
        tagProps: {
          id: "css-app-bundle"
        }
      }
    })

This would generate 2 files in your output directory:

    // js-assets.html
    <script src="app.bundle.js" async=true></script>

    // css-assets.html
    <link href="app.bundle.css" id="css-app-bundle">
