/**
 * Webpack plugin to generate an HTML fragment containing the built js/css assets.
 * See README.md for usage and examples.
 */

const libFn = require('./lib');

function AssetTagPlugin(options = {}) {
  this.options = options;
}

AssetTagPlugin.prototype.apply = function apply(compiler) {
  // Initialize the lib with the things it needs..
  const lib = libFn({
    compiler,
    options: this.options,
  });

  // Hook into the emit lifecycle
  compiler.plugin('emit', (compilation, callback) => {
    // Write the asset tags.
    lib.writeAssetTags(compilation);
    callback();
  });
};

module.exports = AssetTagPlugin;
