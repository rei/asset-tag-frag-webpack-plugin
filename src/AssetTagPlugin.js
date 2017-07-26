/**
 * Webpack plugin to generate an HTML fragment containing the built js/css assets.
 * See README.md for usage and examples.
 */

const libFn = require('./lib');

function AssetTagPlugin(options = {}) {
  this.options = options;
}

AssetTagPlugin.prototype.apply = function apply(compiler) {
  // Hook into the emit lifecycle
  compiler.plugin('emit', (compilation, callback) => {
    // Initialize the lib with the things it needs..
    const lib = libFn({
      options: this.options,
      compiler,
      compilation,
    });

    // Write the asset tags.
    lib.writeAssetTags(compilation);
    callback();
  });
};

module.exports = AssetTagPlugin;
