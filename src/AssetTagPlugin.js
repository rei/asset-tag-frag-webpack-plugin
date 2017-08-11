/**
 * Webpack plugin to generate an HTML fragment containing the built js/css assets.
 * See README.md for usage and examples.
 */

const libFn = require('./lib');
const R = require('ramda');


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

    // Add asset fragments to compilation.
    const htmlTags = lib.addAssetFragments(compilation);

    /**
     * Concatenate asset html tags into a single string.
     * @param {*} htmlFragments 
     * @param {*} ext 
     */
    const concatAssetTypes = (htmlFragments, ext) => {
      return htmlFragments
        .filter(fragment => fragment.ext === ext) // only of type ext.
        .reduce((acc, val, index) => {  // put the html tags in a single string.
          acc += `${val.tag}\n`
          return acc;
        }, '').trim();
    };
    const jsTag = concatAssetTypes(htmlTags, '.js');
    const cssTag = concatAssetTypes(htmlTags, '.css');
    const filename = (ext, options) => R.pathOr(`assets.${ext}.html`, [ext, 'filename'], options);

    if (jsTag) {
      compilation.assets[filename('js', this.options)] = {
        source: () => jsTag,
        size: () => 1
      }
    }

    if (cssTag) {
      compilation.assets[filename('css', this.options)] = {
        source: () => cssTag,
        size: () => 1
      }
    }

    callback();
  });
};

module.exports = AssetTagPlugin;
