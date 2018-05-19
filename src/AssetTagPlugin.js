/* eslint-disable no-param-reassign */

/**
 * Webpack plugin to generate an HTML fragment containing the built js/css assets.
 * See README.md for usage and examples.
 */

const libFn = require('./lib');

function AssetTagPlugin(options = {}) {
  this.options = options;
}

// Hook into the emit lifecycle
AssetTagPlugin.prototype.apply = function apply(compiler) {

  compiler.hooks.emit.tap("AssetTagPlugin", (compilation) => {

    // Pass options to lib.
    const lib = libFn({
      options: this.options,
      compilation,
    });

    // Add new html fragment assets to the compilation.
    compilation.assets = Object.assign(
      compilation.assets,
      lib.createWebpackAssetJS(),
      lib.createWebpackAssetCSS()
    );
  });
};

module.exports = AssetTagPlugin;
