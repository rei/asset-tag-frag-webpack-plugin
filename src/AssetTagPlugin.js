/**
 * Webpack plugin to generate an HTML fragment containing the built js/css assets.
 * See README.md for usage and examples.
 *
 */

const R = require('ramda');
const path = require('path');
const fs = require('fs');

function AssetTagPlugin(options) {
  this.options = options;
}

/**
 * Convert obj to string of key=val pairs
 * @param {*} obj
 */
const objToString = (obj) => {
  if (obj) {
    const keys = Object.keys(obj);
    return keys.reduce((acc, val) => {
      let newAcc = acc;
      newAcc += `${val}="${obj[val]}" `;
      return newAcc;
    }, '').trim();
  }
  return '';
};

/**
   * Creates the snippet of html needed for a built asset.
   * @param {*} assetName The filename of the js/css asset.
   */
const createAssetTagCurried = R.curry((options, assetName) => {
  const ext = path.extname(assetName);
  const tagPropsJs = options.js && options.js.tagProps;
  const tagPropsCss = options.css && options.css.tagProps;

  if (ext === '.js') {
    return {
      ext,
      tag: `<script src="${assetName}" ${objToString(tagPropsJs)}></script>`,
    };
  }

  if (ext === '.css') {
    return {
      ext,
      tag: `<link rel="stylesheet" type="text/css" href="${assetName}" ${objToString(tagPropsCss)}>`,
    };
  }
  throw new Error(`Unexpected asset name: ${assetName}`);
});

  /**
   * Helper to look at intermediate results in compose chain.
   * E.g., R.compose(func1, log, func2)  <-- Logs results from func2.
   */
// const log = R.tap(console.log);

const isJSorCSS = fileName => path.extname(fileName) === '.js' || path.extname(fileName) === '.css';
const getWebpackAssets = compilation => Object.keys(compilation.assets);


  /**
   * Write array of html tags to the dest directory.
   * @param {Array} assetHTMLTags
   */
const writeHtmlTagsCurried = R.curry((destDir, options, assetHTMLTags) => {
  assetHTMLTags.forEach((tagMeta) => {
    if (tagMeta.ext === '.js') {
      const filename = (options.js && options.js.filename) || 'assets.js.html';
      const destinationPath = path.resolve(destDir, filename);
      fs.writeFileSync(destinationPath, tagMeta.tag);
    }

    if (tagMeta.ext === '.css') {
      const filename = (options.css && options.css.filename) || 'assets.css.html';
      const destinationPath = path.resolve(destDir, filename);
      fs.writeFileSync(destinationPath, tagMeta.tag);
    }
  });
});

AssetTagPlugin.prototype.apply = function apply(compiler) {
  const webpackConf = compiler.options;
  const dest = webpackConf.output.path;
  const writeHtmlTags = writeHtmlTagsCurried(dest, this.options);
  const createAssetTag = createAssetTagCurried(this.options);
  const createJsCSSTags = assets => assets.filter(isJSorCSS).map(createAssetTag);
  const createAssetHTML = R.compose(createJsCSSTags, getWebpackAssets);
  const writeAssetTags = R.compose(writeHtmlTags, createAssetHTML);

  // Hook into the emit lifecycle
  compiler.plugin('emit', (compilation, callback) => {
    // Write the asset tags.
    writeAssetTags(compilation);
    callback();
  });
};

module.exports = AssetTagPlugin;
