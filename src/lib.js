const R = require('ramda');
const path = require('path');

/**
 * Configures the lib object with the webpack compiler
 * and the plugin options. Returns object of lib functions.
 * @param {*} opts
 * @param {Object} opts.options The plugin options.
 * @param {Object} opts.compilation The webpack compilation object.
 * @return {Object} The lib functions.
 */
const createLib = function createLib(opts) {
  const options = opts.options;
  const compilation = opts.compilation;

  /**
   * Convert obj to string of key=val pairs
   * @param {*} obj
   */
  const objToString = (obj) => {
    const keys = Object.keys(obj);
    return keys.reduce((acc, val) => {
      let newAcc = acc;
      newAcc += `${val}="${obj[val]}" `;
      return newAcc;
    }, '').trim();
  };

  /**
   * Helpers fns to get tagProps data.
   * @param type The property type (js | css)
   */
  const getTagProps = type => R.pathOr({}, [type, 'tagProps'], options);

  /**
   * Helpers fns to get prependPath for an asset type.
   * @param type The property type (js | css)
   */
  const getPrependPath = type => R.pathOr('', [type, 'prependPath'], options);

  /**
   * Creates the snippet of html needed for a built asset.
   * @param assetName The filename of the js/css asset.
   * @returns {{ext: *, tag: string}}
   */
  const createAssetTag = (assetName) => {
    const ext = path.extname(assetName);
    const tagPropsJs = getTagProps('js');
    const tagPropsCss = getTagProps('css');

    if (ext === '.js') {
      const srcPath = path.join(getPrependPath('js'), assetName);
      const tagPropsString = `src="${srcPath}" ${objToString(tagPropsJs)}`.trim();
      return {
        ext,
        tag: `<script ${tagPropsString}></script>`,
      };
    }

    // Otherwise, css.
    const srcPath = path.join(getPrependPath('css'), assetName);
    const tagPropsString = `rel="stylesheet" type="text/css" href="${srcPath}" ${objToString(tagPropsCss)}`.trim();

    return {
      ext,
      tag: `<link ${tagPropsString}>`,
    };
  };

  const getWebpackAssets = () => Object.keys(compilation.assets);
  const isJS = fileName => path.extname(fileName) === '.js';
  const isCSS = fileName => path.extname(fileName) === '.css';
  const createJsTags = assets => assets.filter(isJS).map(createAssetTag);
  const createCssTags = assets => assets.filter(isCSS).map(createAssetTag);

  /**
   * Concatenate asset html tags into a single string.
   * @param {*} htmlFragments 
   
   */
  const concatAssetTypes = htmlFragments => htmlFragments
    .reduce((acc, val) => {
      let newAcc = acc;
      newAcc += `${val.tag}\n`;
      return newAcc;
    }, '').trim();

  const filename = ext => R.pathOr(`assets.${ext}.html`, [ext, 'filename'], options);

  /**
   * Create the new asset object with api webpack expects.
   */
  const createWebpackAsset = R.curry((type, source) => {
    const asset = {};
    asset[filename(type, options)] = {
      source: () => source,
      size: () => 1,
    };
    return asset;
  });

  /**
   * Creates the webpack asset object for js tag fragment.
   */
  const createWebpackAssetJS = R.compose(
    createWebpackAsset('js'),
    concatAssetTypes,
    createJsTags,
    getWebpackAssets
  );

  /**
   * Creates the webpack asset object for css tag fragment.
   */
  const createWebpackAssetCSS = R.compose(
    createWebpackAsset('css'),
    concatAssetTypes,
    createCssTags,
    getWebpackAssets
  );

  /**
   * The public lib functions.
   */
  return {
    createWebpackAssetJS,
    createWebpackAssetCSS,
  };
};

module.exports = createLib;
