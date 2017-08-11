/**
 * Webpack plugin to generate an HTML fragment containing the built js/css assets.
 * See README.md for usage and examples.
 */

const libFn = require('./lib');

function AssetTagPlugin(options = {}) {
  this.options = options;

  //options.test = true;
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

    // Add asset fragments to compilation.
    const htmlFragments = lib.addAssetFragments(compilation);
    
    const jsTag = htmlFragments
      .filter(fragment => fragment.ext === '.js')
      .reduce((acc, val, index) => {
        acc += `${val.tag}\n`
        return acc;
      }, '').trim();

    const cssTag = htmlFragments
      .filter(fragment => fragment.ext === '.css')
      .reduce((acc, val, index) => {
        acc += `${val.tag}\n`
        return acc;
      }, '').trim();
    
    compilation.assets['assets.js.html'] = {
      source: () => jsTag,
      size: () => 1
    }

    compilation.assets['assets.css.html'] = {
      source: () => cssTag,
      size: () => 1
    }
    
    callback();
  });
};

module.exports = AssetTagPlugin;
